import { getObjectDiff } from "../src/object-diff";

describe("getObjectDiff", () => {
  // it("returns an empty diff if no objects are provided", () => {
  //   expect(getObjectDiff(null, null)).toStrictEqual({
  //     type: "object",
  //     status: "equal",
  //     diff: [],
  //   });
  // });
  // it("consider previous object as completely deleted if no next object is provided", () => {
  //   expect(
  //     getObjectDiff(
  //       { name: "joe", age: 54, hobbies: ["golf", "football"] },
  //       null
  //     )
  //   ).toStrictEqual({
  //     type: "object",
  //     status: "deleted",
  //     diff: [
  //       {
  //         property: "name",
  //         previousValue: "joe",
  //         currentValue: undefined,
  //         status: "deleted",
  //       },
  //       {
  //         property: "age",
  //         previousValue: 54,
  //         currentValue: undefined,
  //         status: "deleted",
  //       },
  //       {
  //         property: "hobbies",
  //         previousValue: ["golf", "football"],
  //         currentValue: undefined,
  //         status: "deleted",
  //       },
  //     ],
  //   });
  // });
  // it("consider next object as completely added if no previous object is provided", () => {
  //   expect(
  //     getObjectDiff(null, {
  //       name: "joe",
  //       age: 54,
  //       hobbies: ["golf", "football"],
  //     })
  //   ).toStrictEqual({
  //     type: "object",
  //     status: "added",
  //     diff: [
  //       {
  //         property: "name",
  //         previousValue: undefined,
  //         currentValue: "joe",
  //         status: "added",
  //       },
  //       {
  //         property: "age",
  //         previousValue: undefined,
  //         currentValue: 54,
  //         status: "added",
  //       },
  //       {
  //         property: "hobbies",
  //         previousValue: undefined,
  //         currentValue: ["golf", "football"],
  //         status: "added",
  //       },
  //     ],
  //   });
  // });
  // it("detects changed between two objects", () => {
  //   expect(
  //     getObjectDiff(
  //       {
  //         id: 54,
  //         user: {
  //           name: "joe",
  //           member: true,
  //           hobbies: ["golf", "football"],
  //           age: 66,
  //         },
  //       },
  //       {
  //         id: 54,
  //         user: {
  //           name: "joe",
  //           member: false,
  //           hobbies: ["golf", "chess"],
  //           age: 66,
  //         },
  //       }
  //     )
  //   ).toStrictEqual({
  //     type: "object",
  //     status: "updated",
  //     diff: [
  //       {
  //         property: "id",
  //         previousValue: 54,
  //         currentValue: 54,
  //         status: "equal",
  //       },
  //       {
  //         property: "user",
  //         previousValue: {
  //           name: "joe",
  //           member: true,
  //           hobbies: ["golf", "football"],
  //           age: 66,
  //         },
  //         currentValue: {
  //           name: "joe",
  //           member: false,
  //           hobbies: ["golf", "chess"],
  //           age: 66,
  //         },
  //         status: "updated",
  //         subPropertiesDiff: [
  //           {
  //             name: "name",
  //             previousValue: "joe",
  //             currentValue: "joe",
  //             status: "equal",
  //           },
  //           {
  //             name: "member",
  //             previousValue: true,
  //             currentValue: false,
  //             status: "updated",
  //           },
  //           {
  //             name: "hobbies",
  //             previousValue: ["golf", "football"],
  //             currentValue: ["golf", "chess"],
  //             status: "updated",
  //           },
  //           {
  //             name: "age",
  //             previousValue: 66,
  //             currentValue: 66,
  //             status: "equal",
  //           },
  //         ],
  //       },
  //     ],
  //   });
  // });
  it("detects changed between two deep nested objects", () => {
    console.log(
      "res",
      JSON.stringify(
        getObjectDiff(
          {
            id: 54,
            user: {
              name: "joe",
              data: {
                member: true,
                hobbies: {
                  football: ["psg"],
                  rugby: ["france"],
                },
              },
            },
          },
          {
            id: 54,
            user: {
              name: "joe",
              data: {
                member: true,
                hobbies: {
                  football: ["psg", "nantes"],
                  rugby: ["france"],
                },
              },
            },
          }
        ),
        null,
        2
      )
    );
    expect(
      getObjectDiff(
        {
          id: 54,
          user: {
            name: "joe",
            data: {
              member: true,
              hobbies: {
                football: ["psg"],
                rugby: ["france"],
              },
            },
          },
        },
        {
          id: 54,
          user: {
            name: "joe",
            data: {
              member: true,
              hobbies: {
                football: ["psg", "nantes"],
                rugby: ["france"],
              },
            },
          },
        }
      )
    ).toStrictEqual({
      type: "object",
      status: "updated",
      diff: [
        {
          property: "id",
          previousValue: 54,
          currentValue: 54,
          status: "equal",
        },
        {
          property: "user",
          previousValue: {
            name: "joe",
            data: {
              member: true,
              hobbies: {
                football: ["psg"],
                rugby: ["france"],
              },
            },
          },
          currentValue: {
            name: "joe",
            data: {
              member: true,
              hobbies: {
                football: ["psg", "nantes"],
                rugby: ["france"],
              },
            },
          },
          status: "updated",
          subPropertiesDiff: [
            {
              name: "name",
              previousValue: "joe",
              currentValue: "joe",
              status: "equal",
            },
            {
              name: "data",
              previousValue: {
                member: true,
                hobbies: {
                  football: ["psg"],
                  rugby: ["france"],
                },
              },
              currentValue: {
                member: true,
                hobbies: {
                  football: ["psg", "nantes"],
                  rugby: ["france"],
                },
              },
              status: "updated",
              subDiff: [
                {
                  name: "member",
                  previousValue: true,
                  currentValue: true,
                  status: "equal",
                },
                {
                  name: "hobbies",
                  previousValue: {
                    football: ["psg"],
                    rugby: ["france"],
                  },
                  currentValue: {
                    football: ["psg", "nantes"],
                    rugby: ["france"],
                  },
                  status: "updated",
                  subDiff: [
                    {
                      name: "football",
                      previousValue: ["psg"],
                      currentValue: ["psg", "nantes"],
                      status: "updated", // error the algo says it's equal...
                    },
                    {
                      name: "rugby",
                      previousValue: ["france"],
                      currentValue: ["france"],
                      status: "equal",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
