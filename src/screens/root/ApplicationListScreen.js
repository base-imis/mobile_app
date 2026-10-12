import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { ROUTES } from "../../core/constants/routes";
import { URLS } from "../../core/constants/urls";
import {
  assessmentService,
  emptyingService,
  sludgeService,
} from "../../service/supervisor_service";
import { useSelector } from "react-redux";
import ApplicationListCard from "../../components/common/ApplicationListCard";
import ApplicationListSludgeCard from "../../components/common/ApplicationListSludgeCard";
import SearchFilterBar from "../../components/common/SearchFilterBar";
import PrimarySpinner from "../../components/common/PrimarySpinner";
import { ErrorMessage } from "../../components/errorComponent";
import { Header } from "../../components/headers";
import {
  getEmptyingAction,
  toNumber,
} from "../../utils/applicationState";

const PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 400;

// Field matchers for the search chips. The emptying list is searched on the
// server (spec §6); these narrow the results further when the user deselects
// a chip, and drive the sludge list, which the server does not paginate.
const FIELD_MATCHERS = {
  bin: (item, q) => String(item?.bin ?? "").toLowerCase().includes(q),
  applicant_name: (item, q) =>
    String(item?.applicant_name ?? "").toLowerCase().includes(q),
  application_id: (item, q) => {
    const id = q.replace("#", "");
    return (
      String(item?.id ?? "").toLowerCase().includes(id) ||
      String(item?.application_id ?? "").toLowerCase().includes(id)
    );
  },
};

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function ApplicationListScreen({ navigation, route }) {
  const { assessment, emptying, sludge, title } = route.params;
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [anfCount, setAnfCount] = useState(0);

  // ─── Search state ───────────────────────────────────────────────
  // Sludge cards have no applicant_name, so that chip is omitted there
  const SEARCH_FILTERS = useMemo(
    () =>
      sludge
        ? [
            { key: "bin", label: "BIN" },
            { key: "application_id", label: "App. ID" },
          ]
        : [
            { key: "bin", label: "BIN" },
            { key: "applicant_name", label: "Name" },
            { key: "application_id", label: "App. ID" },
          ],
    [sludge]
  );
  const [searchValues, setSearchValues] = useState(() =>
    Object.fromEntries(SEARCH_FILTERS.map((f) => [f.key, ""]))
  );
  const [anfOnly, setAnfOnly] = useState(false);

  const handleChangeFilter = (key, value) => {
    setSearchValues((prev) => ({ ...prev, [key]: value }));
  };

  const activeEntries = Object.entries(searchValues).filter(
    ([, value]) => value.trim() !== ""
  );
  const searchText = activeEntries[0]?.[1]?.trim() ?? "";
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);
  // Chip narrowing only applies when the user deselected at least one field
  const isNarrowed =
    activeEntries.length > 0 && activeEntries.length < SEARCH_FILTERS.length;

  const visibleData = useMemo(() => {
    if (activeEntries.length === 0) return data;
    if (emptying && !isNarrowed) return data;
    return data.filter((item) =>
      activeEntries.some(([key, value]) =>
        FIELD_MATCHERS[key]?.(item, value.toLowerCase().trim())
      )
    );
  }, [data, searchValues, emptying, isNarrowed]);

  // ─── Errors ─────────────────────────────────────────────────────
  const handleLoadError = (err) => {
    if (err?.response?.status === 500) {
      Alert.alert(
        "500",
        getLabel("Something is wrong, please try again or at a later time.")
      );
    }
  };

  // ─── Emptying: server-side search, ANF filter, pagination ───────
  // Each new query bumps queryRef; responses for an older query are dropped,
  // so a slow response can't overwrite the results of a newer search.
  const queryRef = useRef(0);

  const emptyingParams = useCallback(
    (page) => ({
      page,
      per_page: PER_PAGE,
      ...(debouncedSearch && { search: debouncedSearch.replace(/^#/, "") }),
      ...(anfOnly && { is_anf: true }),
    }),
    [debouncedSearch, anfOnly]
  );

  const loadEmptyingFirstPage = useCallback(async () => {
    const queryId = ++queryRef.current;
    setIsLoading(true);
    try {
      const res = await emptyingService(emptyingParams(1));
      if (queryId !== queryRef.current) return;
      const { success, data: body } = res.data;
      if (success) {
        setData(body?.applications ?? []);
        setPagination(body?.pagination ?? null);
      }
    } catch (err) {
      if (queryId === queryRef.current) handleLoadError(err);
    } finally {
      if (queryId === queryRef.current) setIsLoading(false);
    }
  }, [emptyingParams]);

  const loadEmptyingNextPage = async () => {
    if (!emptying || isLoading || isLoadingMore || !pagination) return;
    const current = toNumber(pagination.current_page, 1);
    if (current >= toNumber(pagination.last_page, 1)) return;

    const queryId = queryRef.current;
    setIsLoadingMore(true);
    try {
      const res = await emptyingService(emptyingParams(current + 1));
      if (queryId !== queryRef.current) return;
      const { success, data: body } = res.data;
      if (success) {
        setData((prev) => {
          const seen = new Set(prev.map((a) => a.id));
          return [...prev, ...(body?.applications ?? []).filter((a) => !seen.has(a.id))];
        });
        setPagination(body?.pagination ?? null);
      }
    } catch (err) {
      handleLoadError(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Total unresolved ANF applications, for the badge on the ANF chip
  const loadAnfCount = useCallback(async () => {
    try {
      const res = await emptyingService({ is_anf: true, page: 1, per_page: 1 });
      setAnfCount(toNumber(res.data?.data?.pagination?.total));
    } catch (err) {}
  }, []);

  // ─── Sludge / assessment: single, unpaginated fetch ─────────────
  const loadAll = useCallback(async () => {
    const queryId = ++queryRef.current;
    setIsLoading(true);
    try {
      const res = sludge ? await sludgeService() : await assessmentService();
      if (queryId !== queryRef.current) return;
      const { success, data: body } = res.data;
      if (success) {
        setData(body?.applications ?? []);
        setPagination(null);
      }
    } catch (err) {
      if (queryId === queryRef.current) handleLoadError(err);
    } finally {
      if (queryId === queryRef.current) setIsLoading(false);
    }
  }, [sludge]);

  const refresh = useCallback(() => {
    if (emptying) {
      loadEmptyingFirstPage();
      loadAnfCount();
    } else if (sludge || assessment) {
      loadAll();
    }
  }, [emptying, sludge, assessment, loadEmptyingFirstPage, loadAnfCount, loadAll]);

  // Reload on focus (e.g. after saving a trip or resolving ANF) and, for the
  // emptying list, whenever the search text or ANF filter changes.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // ─── Navigation ─────────────────────────────────────────────────
  const openAnfLocate = (item) =>
    navigation.navigate(ROUTES.anf_locate, {
      applicationId: item?.id,
      returnRoute: ROUTES.application_list,
    });

  const onClick = (item) => {
    if (emptying) {
      const action = getEmptyingAction(item);
      if (action === "locate") {
        openAnfLocate(item);
        return;
      }
      if (action === "blocked") {
        Alert.alert(
          getLabel("Not available"),
          getLabel(
            "No emptying trip is available for this application right now. The next trip opens after the previous trip's sludge disposal is recorded."
          )
        );
        return;
      }
      navigation.navigate(ROUTES.application_form, {
        item,
        title: `${getLabel("Emptying Service")} #${item.id}`,
        apiPath: {
          post: URLS.emptyingServiceFieldPost,
          get: URLS.emptyingServiceField,
        },
        type: "emptying",
      });
    }
    if (sludge) {
      navigation.navigate(ROUTES.application_form, {
        item,
        title: `${getLabel("Sludge Collection")} #${item.application_id}`,
        apiPath: {
          post: URLS.sludgeServiceFieldPost,
          get: URLS.sludgeServiceField,
        },
        type: "sludge",
      });
    }
    if (assessment) {
      navigation.navigate(ROUTES.containment_assessment, { item });
    }
  };

  const openPhone = (item) => {
    // Emptying items expose applicant_contact; sludge items service_provider_contact
    const phoneNumber = item?.applicant_contact || item?.service_provider_contact;
    if (!phoneNumber) return;
    Linking.openURL(`tel:${String(phoneNumber).trim()}`);
  };

  const openGoogleMap = (item) => {
    // ANF applications have no geometry until a building is linked
    const point = item?.geometry?.coordinates?.[0]?.[0]?.[0];
    if (!point) {
      Alert.alert(
        getLabel("Location unavailable"),
        getLabel("This application has no mapped building yet.")
      );
      return;
    }
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${point[1]},${point[0]}`;
    const label = `${item?.applicant_name ?? getLabel("Application")}'s location`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  };

  const totalCount = emptying
    ? toNumber(pagination?.total, data.length)
    : data.length;
  const hasQuery = activeEntries.length > 0 || anfOnly;

  return (
    <View style={styles.container}>
      <Header
        title={title ?? getLabel("Application List")}
        showFstpCapacity={!!emptying || !!sludge}
      />
      {(emptying || sludge) && (
        <SearchFilterBar
          filters={SEARCH_FILTERS}
          values={searchValues}
          onChangeFilter={handleChangeFilter}
          resultCount={emptying && !isNarrowed ? totalCount : visibleData.length}
          totalCount={totalCount}
          getLabel={getLabel}
          showAnfToggle={!!emptying}
          anfOnly={anfOnly}
          anfCount={anfCount}
          onAnfToggle={(val) => setAnfOnly(val)}
        />
      )}
      {isLoading && data.length === 0 ? (
        <PrimarySpinner />
      ) : visibleData.length > 0 ? (
        <FlatList
          data={visibleData}
          renderItem={({ item }) =>
            sludge ? (
              <ApplicationListSludgeCard
                item={item}
                onCall={() => openPhone(item)}
                onLocation={() => openGoogleMap(item)}
                onStart={() => onClick(item)}
              />
            ) : (
              <ApplicationListCard
                item={item}
                onCall={() => openPhone(item)}
                onLocation={() => openGoogleMap(item)}
                onStart={() => onClick(item)}
              />
            )
          }
          keyExtractor={(item) => String(item?.id ?? item?.application_id)}
          onRefresh={refresh}
          refreshing={isLoading}
          onEndReached={loadEmptyingNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator style={styles.footerSpinner} />
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      ) : hasQuery ? (
        <ErrorMessage message={getLabel("No results match your search.")} />
      ) : (
        <ErrorMessage
          message={getLabel(
            "No suitable applications available for this service."
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footerSpinner: {
    marginVertical: 16,
  },
});
