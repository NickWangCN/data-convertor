# About data-convertor

Modify the data structure according to the configuration. The main purpose is to resolve the difference between the API return value and the form data.

## Installation

> npm add data-convertor

## Document

Data structure inconsistencies often occur, especially when the front and back ends are developed separately, because the data means different things to different roles. I don't want to always talk about what the data should be called, it just needs a translation.

> Warning: The target data will be modified. If you need to avoid data contamination, a copy of the target data should be passed in.

### Data attribute path

A path is described using a string separated by periods, and an array is represented when there is an empty string between two periods.

For example: `user.name` points to 'Nick' when the data is `{user: {name: 'Nick'}}` and `user.1.name` points to `Wooo` when the data is `{user: [{name: 'Nick'}, {name: 'Wooo'}]}`, but `user..name` refers to 'Nick' and 'Woo' for the previous data.

### Parameter of dataConvertor Method

```ts
interface DataConvertorSettingItem {
  /** Data attribute path from side A */
  sideA: string;
  /** Data attribute path from sideB */
  sideB: string;
  /** Get value method when A to B */
  getValueFromSideA?: (value: any) => any;
  /** Get value method when B to A */
  getValueFromSideB?: (value: any) => any;
}
interface ParameterTypeOfDataConvertorMethod {
  /** Setting array */
  settings: DataConvertorSettingItem[];
  /** Value of sideA */
  sideA: Record<string, any>;
  /** Value of sideB */
  sideB: Record<string, any>;
  /** Reverse conversion, default is A to B */
  B2A?: boolean;
}
```

## Examples

Some examles there.

### Standard usage example

From backend, the value is `{account: string, secretKey: string, realName: string}`, but login form already defined `{username: string, password: string, realName: string}`. You can then declare the configuration:

```js
const settings = [
  { sideA: "account", sideB: "username" },
  { sideA: "secretKey", sideB: "password" },
  { sideA: "realName", sideB: "realName" },
];
const backendValue = { account: "demo", secretKey: "any", realName: "Wooo" };
const translated = DataConvertor.dataConvertor({
  settings,
  sideA: backendValue,
  sideB: {},
});
// Now translated should be {username: 'demo', password: 'any', realName: 'Wooo'};
translated.password = "modified";
DataConvertor.dataConvertor({
  settings,
  sideA: backendValue,
  sideB: translated,
  B2A: true,
});
// Now the backendValue should be {account: 'username', secretKey: 'modified', realName: 'Wooo'}
```

### Partial modification

Method only executes the declared changes.

```js
const settings = [
  { sideA: "account", sideB: "username" },
  { sideA: "secretKey", sideB: "password" },
];
const valueA = { account: "demo", secretKey: "any", realName: "Wooo" };
const valueB = { realName: "Nick", age: 8 };
DataConvertor.dataConvertor({ settings, sideA: valueA, sideB: valueB });
// Now translated should be {username: 'demo', password: 'any', realName: 'Nick', age: 8};
```

### Use conversion function

More complex behavior can be implemented using conversion functions.

```js
const settings = [
  {
    sideA: "account",
    sideB: "company",
    getValueFromSideA: (v) => {
      const values = v.split('/');
      reutrn values[0];
    },
  },
  {
    sideA: "account",
    sideB: "username",
    getValueFromSideA: (v) => {
      const values = v.split('/');
      reutrn values[1];
    },
  },
];
const value = { account: "company/user" };
const translated = DataConvertor.dataConvertor({ settings, sideA: value, sideB: {} });
// should be {company: 'company', username: 'user'}
```

### For list

Also support Arry item.

```js
const settings = [
  {
    sideA: "users..account",
    sideB: "users..username",
  },
];
const value = { users: [{ account: "userA" }, { account: "userB" }] };
DataConvertor.dataConvertor({ settings, sideA: value, sideB: {} });
// Now translated should be [{username: 'userA'}, {username: 'userB'}];
```
