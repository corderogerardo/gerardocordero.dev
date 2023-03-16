import { Equal, Expect } from "../helpers/type-utils";

const myFunc = () => {
  return "hello";
};

/**
 * How do we extract MyFuncReturn from myFunc?
 */
type myFuncType = typeof myFunc;
type MyFuncReturn = ReturnType<myFuncType>;

type tests = [Expect<Equal<MyFuncReturn, string>>];
