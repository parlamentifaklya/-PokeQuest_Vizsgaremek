using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;

namespace PokeQuestApi_New.Filters
{
    using Microsoft.OpenApi.Models;
    using Swashbuckle.AspNetCore.SwaggerGen;
    using System.Collections.Generic;
    using System.Linq;

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
                                    Required = new HashSet<string> { "file" }, // Make the file parameter required
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
                                                Type = "object",
                                                Properties = new Dictionary<string, OpenApiSchema>
                                                {
                                                    { "Name", new OpenApiSchema { Type = "string" } },
                                                    { "Description", new OpenApiSchema { Type = "string" } },
                                                    { "Damage", new OpenApiSchema { Type = "integer" } },
                                                    { "TypeId", new OpenApiSchema { Type = "integer" } }
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
