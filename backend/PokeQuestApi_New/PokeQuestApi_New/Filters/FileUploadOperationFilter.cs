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
                                    Required = new HashSet<string> { "file", "ability" }, // Make both file and ability parameters required
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
                                            "ability", new OpenApiSchema
                                            {
                                                Reference = new OpenApiReference
                                                {
                                                    Type = ReferenceType.Schema,
                                                    Id = nameof(Ability) // Reference the existing Ability model
                                                }
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