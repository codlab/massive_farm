import { Router } from "express";
import Config, { RouteAction, RouteFile } from "./Config";

export function generate(config: Config) {
  //@ts-ignore
  return (req, res) => {
    const json: any = {
      "info": {
        "description": "Automatic documentation",
        "title": "My Little Botnet",
        "version": "1.0.0"
      },
      "host": "opn0.fr",
      "basePath": "/v1",
      "produces": ["application/json", "application/xml"],
      "schemes": ["https"],
      "swagger": "2.0",
      "paths": {
        "/devices.json": {
          "get": {
            "parameters": [],
            "description": "\nList of available devices",
            "tags": ["devices"],
            "responses": {
              "200": {
                "description": "An array of devices",
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/definitions/Device"
                  }
                }
              },
              "default": {
                "description": "Unexpected error"
              }
            }
          }
        },
        "/{serial}/lock.json": {
          "get": {
            "parameters": [{
              "name": "serial",
              "in": "path",
              "description": "serial of the device",
              "required": true,
              "type": "string"
            }, {
              "name": "code",
              "in": "query",
              "description": "custom code used for the registration",
              "required": true,
              "type": "string"
            }],
            "description": "\nLock a specific device for 5min",
            "tags": ["locks"],
            "responses": {
              "200": {
                "description": "Result"
              },
              "default": {
                "description": "Unexpected error"
              }
            }
          }
        },
        "/{serial}/unlock.json": {
          "get": {
            "parameters": [{
              "name": "serial",
              "in": "path",
              "description": "serial of the device",
              "required": true,
              "type": "string"
            }, {
              "name": "code",
              "in": "query",
              "description": "custom code which was previously used for lock",
              "required": true,
              "type": "string"
            }],
            "description": "\nUnlock a specific device for 5min",
            "tags": ["locks"],
            "responses": {
              "200": {
                "description": "Result"
              },
              "default": {
                "description": "Unexpected error"
              }
            }
          }
        }
      },
      "definitions": {
        "Device": {
          "required": [],
          "properties": {
            "id": {
              "type": "string",
              "description": "serial of the device"
            },
            "type": {
              "type": "string",
              "description": "the device's type"
            },
            "available": {
              "type": "boolean",
              "description": "flag telling if the device can be reserved"
            },
            "infos": {
              "type": "object",
              "description": ""
            }
          }
        }
      },
      "responses": {},
      "parameters": {},
      "securityDefinitions": {},
      "tags": [{
        "name": "devices",
        "description": "List devices"
      }, {
        "name": "locks",
        "description": "Operations to register a device"
      }, {
        "name": "actions",
        "description": "Operations on a device"
      }, {
        "name": "files",
        "description": "Operations from files on a device"
      }]
    }

    config?.routes.forEach(route => {
      const routeAction = route as RouteAction;
      const routeFile = route as RouteFile;

      const isFile = !!routeFile?.path;

      // manually replace id to serial
      const name = route.url.replace(":id","{serial}");
      const get: any = {
        parameters: [{
          "name": "serial",
          "in": "path",
          "description": "serial of the device",
          "required": true,
          "type": "string"
        }, {
          "name": "code",
          "in": "query",
          "description": "custom code which was previously used for lock",
          "required": true,
          "type": "string"
        }],
        description: "",
        tags: [ isFile ? "files" : "actions" ],
        responses: {
          "200": {
            "description": "Default success"
          },
          "default": {
            "description": "Default error"
          }
        }
      };

      routeAction?.options?.forEach(option => {
        get.parameters.push({
          "name": option.key,
          "in": "params",
          "description": `default: ${option.def || null}`,
          "required": true,
          "type": "string"
        });
      });

      json.paths[name] = { get };
    });
    
    res.json(json);
  };
}