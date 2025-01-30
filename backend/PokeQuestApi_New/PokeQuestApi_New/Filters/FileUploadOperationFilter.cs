using Microsoft.OpenApi.Models;
using PokeQuestApi_New.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;

namespace PokeQuestApi_New.Filters
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check if the action method is CreateAbility or UpdateAbility
            var actionName = context.ApiDescription.ActionDescriptor.RouteValues["action"];
            if (actionName == "CreateAbility" || actionName == "UpdateAbility")
            {
                operation.RequestBody = new OpenApiRequestBody
                {
                    Description = "File to upload and ability details",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        {
                            "multipart/form-data", new OpenApiMediaType
                            {
                                Schema = new OpenApiSchema
                                {
                                    Type = "object",
                                    Required = new HashSet<string> { "file", "name", "typeId" }, // Make required properties explicit
                                    Properties = new Dictionary<string, OpenApiSchema>
                                    {
                                        {
                                            "file", new OpenApiSchema
                                            {
                                                Type = "string",
                                                Format = "binary" // Specify that this is a binary file upload
                                            }
                                        },
                                        {
                                            "name", new OpenApiSchema
                                            {
                                                Type = "string" // Ability name
                                            }
                                        },
                                        {
                                            "description", new OpenApiSchema
                                            {
                                                Type = "string" // Ability description
                                            }
                                        },
                                        {
                                            "damage", new OpenApiSchema
                                            {
                                                Type = "integer" // Ability damage
                                            }
                                        },
                                        {
                                            "typeId", new OpenApiSchema
                                            {
                                                Type = "integer" // TypeId for the ability
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            }
        }
    }
}