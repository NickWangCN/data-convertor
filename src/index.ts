import { DataConvertorTypes } from "./typings";

/** Path separator */
const pathSeparator = ".";

/**
 * Get object attribute value by path
 * @param params DataConvertorTypes.ParameterTypeOfGetObjectValueByPathMethod
 * @returns any
 */
const getObjectValueByPath = (
  params: DataConvertorTypes.ParameterTypeOfGetObjectValueByPathMethod
): any => {
  const pathArray = params.path.split(".");
  let current = params.record;
  pathArray.forEach((key) => {
    if (current !== undefined) {
      current = current[key];
    }
  });
  if (params.getValueMethod) {
    return params.getValueMethod(current);
  }
  return current;
};

/**
 * Set object attribute value by path
 * @param params DataConvertorTypes.ParameterTypeOfSetObjectValueByPathMethod
 */
const setObjectValueByPath = (
  params: DataConvertorTypes.ParameterTypeOfSetObjectValueByPathMethod
): undefined => {
  const pathArray = params.path.split(".");
  const finalAttributeName = pathArray.pop()!;
  let current = params.record;
  for (let i = 0, l = pathArray.length; i < l; i++) {
    if (current[pathArray[i]] === undefined) {
      if (pathArray[i + 1] === "0") {
        current[pathArray[i]] = [];
      } else {
        current[pathArray[i]] = {};
      }
    }
    current = current[pathArray[i]];
  }
  current[finalAttributeName] = params.value;
};

/**
 * Use array segmentation to get the segmented path
 * @param path string
 * @returns string[]
 */
const getSubPathArray = (pathString: string): string[] => {
  const keyArray: string[] = pathString.split(pathSeparator);
  const subPathArray: string[] = [];
  let subPath: string[] = [];
  keyArray.forEach((key) => {
    if (key) {
      subPath.push(key);
    } else {
      if (subPath.length) {
        subPathArray.push(subPath.join(pathSeparator));
        subPath = [];
      }
      subPathArray.push("");
    }
  });
  if (subPath.length) {
    subPathArray.push(subPath.join(pathSeparator));
  }
  return subPathArray;
};

/**
 * Get target points array
 * if subPathArray = ['a', '', 'b'] and value = {a: [{}, {}]}
 * then will return ['a.0.b', 'a.1.b']
 * @param params DataConvertorTypes.ParameterTypeOfGetTargetPointsByPathArray
 * @returns string[]
 */
const getTargetPointsByPathArray = (
  params: DataConvertorTypes.ParameterTypeOfGetTargetPointsByPathArray
): string[] => {
  const targetPoints: string[] = [];
  const currentSubPath: string = params.subPathArray.shift();
  let current: any = getObjectValueByPath({
    path: currentSubPath,
    record: params.record,
  });
  if (!params.subPathArray.length) {
    targetPoints.push(currentSubPath);
  } else {
    const nextSubPath: string = params.subPathArray.shift();
    if ((current === undefined || Array.isArray(current)) && !nextSubPath) {
      if (current === undefined) {
        const mergedPath = `${currentSubPath}${pathSeparator}0`;
        targetPoints.push(
          ...getTargetPointsByPathArray({
            subPathArray: [mergedPath, ...params.subPathArray],
            record: params.record,
          })
        );
      } else {
        current.forEach((_value, indexNumber) => {
          const mergedPath = `${currentSubPath}${pathSeparator}${indexNumber}`;
          targetPoints.push(
            ...getTargetPointsByPathArray({
              subPathArray: [mergedPath, ...params.subPathArray],
              record: params.record,
            })
          );
        });
      }
    } else if (!Array.isArray(current) && nextSubPath) {
      if (current === undefined) {
        current = {};
      }
      const mergedPath = `${currentSubPath}${pathSeparator}${nextSubPath}`;
      targetPoints.push(
        ...getTargetPointsByPathArray({
          subPathArray: [mergedPath, ...params.subPathArray],
          record: params.record,
        })
      );
    } else {
      throw "The path not match record.";
    }
  }
  return targetPoints;
};

/**
 * Object attribute convertor method
 * @param params DataConvertorTypes.ParameterTypeOfObjectConvertorMethod
 * @returns Record<string, any> | undefined
 */
const dataItemConvertor = (
  params: DataConvertorTypes.ParameterTypeOfDataItemConvertorMethod
): Record<string, any> | undefined => {
  /** Segmented processing by Array */
  const fromSubPathArray = getSubPathArray(params.fromKey);
  const toSubPathArray = getSubPathArray(params.toKey);
  /** Exception */
  if (
    fromSubPathArray.length > 1 &&
    toSubPathArray.filter((item) => item === "").length !==
      fromSubPathArray.filter((item) => item === "").length
  ) {
    console.error(
      `Bad setting between ${params.fromKey} and ${params.toKey}, the number of arrays must be consistent. For example, 'a..b => c.d..e' is ok, but 'a..b => c..d..e' not.`
    );
    return undefined;
  }

  if (fromSubPathArray.length === 1 && toSubPathArray.length > 1) {
    /** One-to-many processing */
    const targetPoints = getTargetPointsByPathArray({
      subPathArray: toSubPathArray,
      record: params.to,
    });
    const value = getObjectValueByPath({
      path: fromSubPathArray[0],
      record: params.from,
      getValueMethod: params.getValueMethod,
    });
    targetPoints.forEach((path) => {
      setObjectValueByPath({
        record: params.to,
        path,
        value,
      });
    });
  } else {
    /** One-to-one processing */
    const fromPoints = getTargetPointsByPathArray({
      subPathArray: fromSubPathArray,
      record: params.from,
    });
    fromPoints.forEach((fromPoint) => {
      const arrayKeys = fromPoint.match(/\b\d+\b/g);
      let currentLocation = 0;
      let toPointArray = [];
      toSubPathArray.forEach((subPath) => {
        if (!subPath) {
          toPointArray.push(arrayKeys[currentLocation]);
          currentLocation++;
        } else {
          toPointArray.push(subPath);
        }
      });
      const value = getObjectValueByPath({
        path: fromPoint,
        record: params.from,
        getValueMethod: params.getValueMethod,
      });
      setObjectValueByPath({
        record: params.to,
        path: toPointArray.join(pathSeparator),
        value,
      });
    });
  }

  return params.to;
};

/**
 * Translate data to different structure
 *
 * @param params DataConvertorTypes.ParameterTypeOfDataConvertorMethod
 * @returns Record<string, any> | undefined
 */
const dataConvertor = (
  params: DataConvertorTypes.ParameterTypeOfDataConvertorMethod
): Record<string, any> | undefined => {
  const { sideA, sideB, settings, B2A = false } = params;
  const from = B2A === true ? sideB : sideA;
  const to: Record<string, any> = B2A === true ? sideA : sideB;
  const errors = [];
  settings.forEach((setting) => {
    const fromAnyKey = B2A ? setting.sideB : setting.sideA;
    const toAnyKey = B2A ? setting.sideA : setting.sideB;
    const getValueMethod = B2A
      ? setting.getValueFromSideB
      : setting.getValueFromSideA;
    const itemResult = dataItemConvertor({
      toKey: toAnyKey,
      to,
      fromKey: fromAnyKey,
      from,
      getValueMethod,
    });
    if (itemResult === undefined) {
      errors.push(`Error: ${fromAnyKey} => ${toAnyKey}`);
    }
  });
  if (errors.length) {
    console.error(errors);
    return undefined;
  }
  return B2A ? params.sideA : params.sideB;
};

export default {
  pathSeparator,
  getObjectValueByPath,
  setObjectValueByPath,
  getSubPathArray,
  getTargetPointsByPathArray,
  dataItemConvertor,
  dataConvertor,
};
