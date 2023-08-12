import DataConvertor from "../src";
import assert from "assert";

describe("DataConvertor", () => {
  it("Test-getSubPathArray#Basic", () => {
    const params = "a.b.c.d.e";
    const values = DataConvertor.getSubPathArray(params);
    const shouleValues = ["a.b.c.d.e"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-getSubPathArray#MiddelArray", () => {
    const params = "a.b..c.d..e";
    const values = DataConvertor.getSubPathArray(params);
    const shouleValues = ["a.b", "", "c.d", "", "e"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-getSubPathArray#EndArray", () => {
    const params = "a.b..c.d.";
    const values = DataConvertor.getSubPathArray(params);
    const shouleValues = ["a.b", "", "c.d", ""];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-getSubPathArray#NestedArray", () => {
    const params = "a...c.d";
    const values = DataConvertor.getSubPathArray(params);
    const shouleValues = ["a", "", "", "c.d"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });

  it("Test-getTargetPointsByPathArray#Basic", () => {
    const params = { subPathArray: ["a.b"], record: {} };
    const values = DataConvertor.getTargetPointsByPathArray(params);
    const shouleValues = ["a.b"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-getTargetPointsByPathArray#SingleArray", () => {
    const params = { subPathArray: ["a", "", "b"], record: { a: [{}, {}] } };
    const values = DataConvertor.getTargetPointsByPathArray(params);
    const shouleValues = ["a.0.b", "a.1.b"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-getTargetPointsByPathArray#NestedArray", () => {
    const params = {
      subPathArray: ["a", "", "", "b"],
      record: {
        a: [
          [{}, {}],
          [{}, {}],
        ],
      },
    };
    const values = DataConvertor.getTargetPointsByPathArray(params);
    const shouleValues = ["a.0.0.b", "a.0.1.b", "a.1.0.b", "a.1.1.b"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-getTargetPointsByPathArray#Empty", () => {
    const params = {
      subPathArray: ["a", "", "", "b"],
      record: {},
    };
    const values = DataConvertor.getTargetPointsByPathArray(params);
    const shouleValues = ["a.0.0.b"];
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });

  it("Test-dataItemConvertor#Basic", () => {
    const params = {
      from: { a: 5 },
      fromKey: "a",
      to: { b: 3 },
      toKey: "b",
    };
    const values = DataConvertor.dataItemConvertor(params);
    const shouleValues = { b: 5 };
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-dataItemConvertor#AddAttribute", () => {
    const params = {
      from: { a: 5 },
      fromKey: "a",
      to: { c: 3 },
      toKey: "b",
    };
    const values = DataConvertor.dataItemConvertor(params);
    const shouleValues = { c: 3, b: 5 };
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-dataItemConvertor#Double", () => {
    const params = {
      from: { a: { b: 5 } },
      fromKey: "a.b",
      to: {},
      toKey: "c.d",
    };
    const values = DataConvertor.dataItemConvertor(params);
    const shouleValues = { c: { d: 5 } };
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-dataItemConvertor#OneToMany", () => {
    const params = {
      from: { a: 5 },
      fromKey: "a",
      to: { b: [{}, {}] },
      toKey: "b..c",
    };
    const values = DataConvertor.dataItemConvertor(params);
    const shouleValues = { b: [{ c: 5 }, { c: 5 }] };
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-dataItemConvertor#OneToOne", () => {
    const params = {
      from: { a: [{ b: 5 }, { b: 6 }] },
      fromKey: "a..b",
      to: { c: [{ d: 3 }, { d: 4 }] },
      toKey: "c..d",
    };
    const values = DataConvertor.dataItemConvertor(params);
    const shouleValues = { c: [{ d: 5 }, { d: 6 }] };
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-dataItemConvertor#ByMethod", () => {
    const params = {
      from: { a: { b: 5, c: 6 } },
      fromKey: "a",
      to: { d: 1 },
      toKey: "d",
      getValueMethod: (values: any) => values.b * values.c,
    };
    const values = DataConvertor.dataItemConvertor(params);
    const shouleValues = { d: 30 };
    assert.equal(JSON.stringify(shouleValues), JSON.stringify(values));
  });
  it("Test-dataItemConvertor#Error", () => {
    const params = {
      from: { a: [{ b: 5 }, { b: 6 }] },
      fromKey: "a..b",
      to: {},
      toKey: "c..d..e",
    };
    const values = DataConvertor.dataItemConvertor(params);
    assert.equal(undefined, values);
  });

  it("Test-dataConvertor#Basic", () => {
    const paramsA = {
      settings: [
        { sideA: "a", sideB: "A" },
        {
          sideA: "b",
          sideB: "B",
          getValueFromSideA: (v: string) => v.toUpperCase(),
          getValueFromSideB: (v: string) => v.toLowerCase(),
        },
      ],
      sideA: { a: "Hello", b: "world" },
      sideB: { A: "World", B: "HELLO" },
    };
    const shouldValuesA = { A: "Hello", B: "WORLD" };
    const valuesA = DataConvertor.dataConvertor(paramsA);
    assert.equal(JSON.stringify(shouldValuesA), JSON.stringify(valuesA));

    const paramsB = {
      settings: [
        { sideA: "a", sideB: "A" },
        {
          sideA: "b",
          sideB: "B",
          getValueFromSideA: (v: string) => v.toUpperCase(),
          getValueFromSideB: (v: string) => v.toLowerCase(),
        },
      ],
      sideA: { a: "Hello", b: "world" },
      sideB: { A: "World", B: "HELLO" },
      B2A: true,
    };
    const shouldValuesB = { a: "World", b: "hello" };
    const valuesB = DataConvertor.dataConvertor(paramsB);
    assert.equal(JSON.stringify(shouldValuesB), JSON.stringify(valuesB));
  });
  it("Test-dataConvertor#Owner", () => {
    const values = { a: "a", A: "A" };
    const params = {
      settings: [{ sideA: "a", sideB: "A" }],
      sideA: values,
      sideB: values,
    };
    const shouldValues = { a: "a", A: "a" };
    DataConvertor.dataConvertor(params);
    assert.equal(JSON.stringify(shouldValues), JSON.stringify(values));
  });
  it("Test-dataConvertor#Assign", () => {
    const paramsA = {
      settings: [{ sideA: "a", sideB: "A..B" }],
      sideA: { a: "id" },
      sideB: { A: [{ child: "A" }, { child: "B" }] },
    };
    const shouldValuesA = {
      A: [
        { child: "A", B: "id" },
        { child: "B", B: "id" },
      ],
    };
    const valuesA = DataConvertor.dataConvertor(paramsA);
    assert.equal(JSON.stringify(shouldValuesA), JSON.stringify(valuesA));
  });
  it("Test-dataConvertor#SimpleArray", () => {
    const paramsA = {
      settings: [{ sideA: "a..a", sideB: "A..A" }],
      sideA: {
        a: [{ a: "Hello" }, { a: "World" }],
      },
      sideB: {},
    };
    const shouldValuesA = {
      A: [{ A: "Hello" }, { A: "World" }],
    };
    const valuesA = DataConvertor.dataConvertor(paramsA);
    assert.equal(JSON.stringify(shouldValuesA), JSON.stringify(valuesA));
  });
  it("Test-dataConvertor#NesteArray", () => {
    const paramsA = {
      settings: [{ sideA: "a....a", sideB: "A..IN...A" }],
      sideA: {
        a: [
          [
            [{ a: "Hello" }, { a: "World" }],
            [{ a: "Hello" }, { a: "World" }],
          ],
          [
            [{ a: "Hello" }, { a: "World" }],
            [{ a: "Hello" }, { a: "World" }],
          ],
        ],
      },
      sideB: {
        A: [
          {
            IN: [
              [{ A: "Hi" }, { A: "Nick" }],
              [{ A: "Hi" }, { A: "Nick" }],
            ],
          },
          {
            IN: [
              [{ A: "Hi" }, { A: "Nick" }],
              [{ A: "Hi" }, { A: "Nick" }],
            ],
          },
        ],
      },
    };
    const shouldValuesA = {
      A: [
        {
          IN: [
            [{ A: "Hello" }, { A: "World" }],
            [{ A: "Hello" }, { A: "World" }],
          ],
        },
        {
          IN: [
            [{ A: "Hello" }, { A: "World" }],
            [{ A: "Hello" }, { A: "World" }],
          ],
        },
      ],
    };
    const valuesA = DataConvertor.dataConvertor(paramsA);
    assert.equal(JSON.stringify(shouldValuesA), JSON.stringify(valuesA));
  });
});
