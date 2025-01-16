using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PokeQuestApi_New.Data;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowALlOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        public FileUploadController(PokeQuestApiContext context)
        {
            context = _context;
        }

        [HttpPost("image-upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // Ensure the Uploads directory exists
            var uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            if (!Directory.Exists(uploadsDirectory))
            {
                Directory.CreateDirectory(uploadsDirectory); // Create the directory if it doesn't exist
            }

            // Get the original file name and ensure it doesn't contain invalid characters
            var fileName = Path.GetFileName(file.FileName);  // Preserve the original file name
            fileName = Path.GetFileNameWithoutExtension(fileName); // Remove any path components
            var fileExtension = Path.GetExtension(file.FileName); // Get the file extension
            var safeFileName = fileName + fileExtension;  // Recombine the name and extension to ensure it's safe

            // Define the path to save the file
            var filePath = Path.Combine(uploadsDirectory, safeFileName);

            // Ensure unique file name if a file with the same name exists
            int counter = 1;
            while (System.IO.File.Exists(filePath))
            {
                var newFileName = Path.GetFileNameWithoutExtension(safeFileName) + "_" + counter + fileExtension;
                filePath = Path.Combine(uploadsDirectory, newFileName);
                counter++;
            }

            // Save the file to the disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the path of the saved file
            return Ok(new { FilePath = filePath });
        }

    }
}