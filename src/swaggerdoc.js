import config from "./envvars";

export default {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Node.js API for Rate and Ride",
    description: "Node.js API for Rate and Ride",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  host: `localhost:${config.port}`,
  basePath: "/api/v1",
  tags: [
    {
      name: "Users",
      description: "API for users in the system"
    }
  ],
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  paths: {
    "/auth/preload": {
      post: {
        tags: ["User Auth"],
        summary: "Gets limited information on a user(public route).",
        consumes: ["application/json"],
        parameters: { name: ["user"], in: "body" }
      }
    }
  },
  //   paths: {
  //     "/users": {
  //       post: {
  //         tags: ["Users"],
  //         description: "Create new user in system",
  //         parameters: [
  //           {
  //             name: "user",
  //             in: "body",
  //             description: "User that we want to create",
  //             schema: {
  //               $ref: "#/definitions/User"
  //             }
  //           }
  //         ],
  //         produces: ["application/json"],
  //         responses: {
  //           "200": {
  //             description: "New user is created",
  //             schema: {
  //               $ref: "#/definitions/User"
  //             }
  //           }
  //         }
  //       },
  //       get: {
  //         tags: ["Users"],
  //         summary: "Get all users in system",
  //         responses: {
  //           "200": {
  //             description: "OK",
  //             schema: {
  //               $ref: "#/definitions/Users"
  //             }
  //           }
  //         }
  //       }
  //     },
  //     "/users/{userId}": {
  //       parameters: [
  //         {
  //           name: "userId",
  //           in: "path",
  //           required: true,
  //           description: "ID of user that we want to find",
  //           type: "string"
  //         }
  //       ],
  //       get: {
  //         tags: ["Users"],
  //         summary: "Get user with given ID",
  //         responses: {
  //           "200": {
  //             description: "User is found",
  //             schema: {
  //               $ref: "#/definitions/User"
  //             }
  //           }
  //         }
  //       },
  //       delete: {
  //         summary: "Delete user with given ID",
  //         tags: ["Users"],
  //         responses: {
  //           "200": {
  //             description: "User is deleted",
  //             schema: {
  //               $ref: "#/definitions/User"
  //             }
  //           }
  //         }
  //       },
  //       put: {
  //         summary: "Update user with give ID",
  //         tags: ["Users"],
  //         parameters: [
  //           {
  //             name: "user",
  //             in: "body",
  //             description: "User with new values of properties",
  //             schema: {
  //               $ref: "#/definitions/User"
  //             }
  //           }
  //         ],
  //         responses: {
  //           "200": {
  //             description: "User is updated",
  //             schema: {
  //               $ref: "#/definitions/User"
  //             }
  //           }
  //         }
  //       }
  //     }
  //   },
  definitions: {
    User: {
      required: ["userName", "email", "_id"],
      properties: {
        _id: {
          type: "string",
          uniqueItems: true
        },
        userName: {
          type: "string",
          uniqueItems: true
        },
        firstName: {
          type: "string"
        },
        lastName: {
          type: "string"
        },
        email: {
          type: "string",
          uniqueItems: true
        },
        password: {
          type: "string"
        },
        gender: {
          type: "string"
        },
        is_admin: {
          type: "boolean"
        },
        register_ip: {
          type: "string"
        },
        timestamp_register: {
          type: "string"
        },
        timestamp_last_login: {
          type: "string"
        },
        activated: {
          type: "string"
        },
        deactivated: {
          type: "string"
        },
        verified: {
          type: "string"
        }
      }
    },
    Users: {
      type: "array",
      $ref: "#/definitions/User"
    }
  }
};
