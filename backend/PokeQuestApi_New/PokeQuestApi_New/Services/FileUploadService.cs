namespace PokeQuestApi_New.Services
{
    public class ImageUploadService
    {
        private readonly string _uploadsDirectory;

        public ImageUploadService()
        {
            _uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            if (!Directory.Exists(_uploadsDirectory))
            {
                Directory.CreateDirectory(_uploadsDirectory);
            }
        }

        public async Task<string> UploadImage(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded.");
            }

            // Create a subfolder for the specific controller/entity type
            var folderPath = Path.Combine(_uploadsDirectory, folderName);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Process the file name to avoid conflicts
            var fileName = Path.GetFileName(file.FileName);
            fileName = Path.GetFileNameWithoutExtension(fileName);
            var fileExtension = Path.GetExtension(file.FileName);
            var safeFileName = fileName + fileExtension;

            // Ensure the file name is unique
            var filePath = Path.Combine(folderPath, safeFileName);
            int counter = 1;
            while (System.IO.File.Exists(filePath))
            {
                var newFileName = Path.GetFileNameWithoutExtension(safeFileName) + "_" + counter + fileExtension;
                filePath = Path.Combine(folderPath, newFileName);
                counter++;
            }

            // Save the file to the server
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return filePath;  // Return the full file path where the file is saved
        }
    }
}
