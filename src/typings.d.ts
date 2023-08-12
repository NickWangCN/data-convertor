export namespace DataConvertorTypes {
  interface ParameterTypeOfGetObjectValueByPathMethod {
    /** Current value */
    record: Record<string, any>;
    /** Data attribute path */
    path: string;
    /** Custom method use for get value */
    getValueMethod?: (value: any) => any;
  }
  interface ParameterTypeOfSetObjectValueByPathMethod {
    /** Current value */
    record: Record<string, any>;
    /** Data attribute path */
    path: string;
    /** New value */
    value: any;
  }
  interface ParameterTypeOfDataItemConvertorMethod {
    toKey: string;
    to: any;
    fromKey: string;
    from: any;
    getValueMethod?: (value: any) => any;
  }
  interface ParameterTypeOfGetTargetPointsByPathArray {
    subPathArray: string[];
    record: Record<string, any>;
  }
  interface DataConvertorSettingItem {
    /** Data attribute path of Side A */
    sideA: string;
    /** Data attribute path of Side B */
    sideB: string;
    /** Get value method when A to B */
    getValueFromSideA?: (value: any) => any;
    /** Get value method when B to A */
    getValueFromSideB?: (value: any) => any;
  }
  interface ParameterTypeOfDataConvertorMethod {
    /** Setting items */
    settings: DataConvertorSettingItem[];
    /** Value of Side A */
    sideA: Record<string, any>;
    /** Value of Side B */
    sideB: Record<string, any>;
    /** Reverse conversion, default is A to B */
    B2A?: boolean;
  }
}
