import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from "react-native";
import ApplicationCard from "../../components/common/ApplicationCard";
import { ROUTES } from "../../core/constants/routes";
import {
  assessmentService,
  emptyingService,
} from "../../service/supervisor_service";
import { useDispatch, useSelector } from "react-redux";
import { resetToken } from "../../store/slices/auth.slice";
import ApplicationListCard from "../../components/common/ApplicationListCard";
import { List } from "react-native-paper";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PrimarySpinner from "../../components/common/PrimarySpinner";
import { ErrorMessage } from "../../components/errorComponent";
import { Header } from "../../components/headers";
import ApplicationListSupervisoryCard from "../../components/common/ApplicationListSupervisoryCard";

export default function ApplicationListScreen({ navigation, route }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { assessment, emptying } = route.params;
  const dispatch = useDispatch();

  console.log("Data Of Application List", data);
  //Application Emptying Service api
  const getApplicationEmptyingService = () => {
    setIsLoading(true);
    emptyingService()
      .then((res) => {
        const { data, success, error } = res.data;
        if (success) {
          setData(data.applications);
        } else {
          console.log(error);
        }
      })
      .catch((err) => {
        console.log("errr", err);

        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            "Something is wrong, please try again or at a later time."
          );
        }
      })
      .finally(() => setIsLoading(false));
  };

  //Application Assessment api
  const getApplicationAssessment = () => {
    setIsLoading(true);
    assessmentService()
      .then(async (res) => {
        const { data, success, error } = res.data;
        console.log("getApplicationAssessment", res);

        if (success) {
          setData(data.applications);
        } else {
          console.log(error);
        }
      })
      .catch((err) => {
        console.log("Error", err);
        if (err?.response?.status === 500) {
          Alert.alert(
            "500",
            "Something is wrong, please try again or at a later time."
          );
        }
      })
      .finally(() => setIsLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
      if (emptying) {
        getApplicationEmptyingService();
      }
      if (assessment) {
        getApplicationAssessment();
      }
    }, [navigation])
  );

  const onClick = (item) => {
    if (emptying) {
      navigation.navigate(ROUTES.empty_submission, { item });
    }
    if (assessment) {
      navigation.navigate(ROUTES.containment_assessment, { item });
    }
  };

  const openPhone = (item) => {
    if (emptying) {
      Linking.openURL(`tel:${item?.applicant_contact}`);
    }
    if (assessment == true) {
      Linking.openURL(`tel:${item?.owner_contact}`);
    }
  };

  const openGoogleMap = (item) => {
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${item.geometry.coordinates[0][0][0][1]},${item.geometry.coordinates[0][0][0][0]}`;
    const label = `${item?.applicant_name}'s location`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };
  const { contentsLabel } = useSelector((state) => state.auth);
  const getLabel = (key) => contentsLabel?.[key] || key;
  return (
    <View style={styles.container}>
      <Header title={getLabel("Application List")} />
      {/* <Text>{JSON.stringify(data)}</Text> */}
      {!!isLoading ? (
        <PrimarySpinner />
      ) : data.length > 0 ? (
        // <List.Section>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <>
              {emptying == true && (
                <>
                  <ApplicationListCard
                    item={item}
                    onCall={() => openPhone(item)}
                    onLocation={() => openGoogleMap(item)}
                    onStart={() => onClick(item)}
                  />
                </>
              )}
              {assessment == true && (
                <>
                  <ApplicationListSupervisoryCard
                    item={item}
                    onCall={() => openPhone(item)}
                    onLocation={() => openGoogleMap(item)}
                    onStart={() => onClick(item)}
                  />
                </>
              )}
            </>
          )}
          onRefresh={
            emptying
              ? () => getApplicationEmptyingService()
              : () => getApplicationAssessment()
          }
          refreshing={isLoading}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      ) : (
        // </List.Section>
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
  emptyText: {
    alignSelf: "center",
  },
});
