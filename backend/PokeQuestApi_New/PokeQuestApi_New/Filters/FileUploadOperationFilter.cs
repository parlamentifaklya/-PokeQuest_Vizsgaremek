using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.AspNetCore.Mvc.Controllers;
using System.Collections.Generic;

namespace PokeQuestApi_New.Filters
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check if the current action is for file upload (e.g., action name contains "Upload")
            var controllerActionDescriptor = context.ApiDescription.ActionDescriptor as ControllerActionDescriptor;
            if (controllerActionDescriptor != null &&
                controllerActionDescriptor.ActionName.ToLower().Contains("upload"))
            {
                // Modify the RequestBody to expect a file
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        {
                            "multipart/form-data", new OpenApiMediaType
                            {
                                Schema = new OpenApiSchema
                                {
                                    Type = "object",
                                    Properties = new Dictionary<string, OpenApiSchema>
                                    {
                                        { "file", new OpenApiSchema { Type = "string", Format = "binary" } }
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
