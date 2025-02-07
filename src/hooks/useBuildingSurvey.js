import {useFormik} from 'formik';

const useBuildingSurvey = () => {
  const initialValues = {
    is_main_building: false,
    functional_use: '',
    building_use: '',
    technology: '0',
    vacutug_accessible: 'no',
    containment_location: '',
    compliance: false,
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values, helpers) => {},
  });

  return {formik};
};

export default useBuildingSurvey;
