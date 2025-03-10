using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PokeQuestWPF
{
    public class FeylingService
    {
        private readonly HttpClient _httpClient;

        public FeylingService()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri("http://localhost:5130/") }; // Update to match your API URL
        }

        public async Task<List<Feyling>> GetAllFeylingsAsync()
        {
            var response = await _httpClient.GetAsync("api/Feylings/GetAllFeylings");
            response.EnsureSuccessStatusCode(); // Throws exception if not successful

            return await response.Content.ReadFromJsonAsync<List<Feyling>>();
        }

        public async Task<Feyling> GetFeylingByIdAsync(int id)
        {
            var response = await _httpClient.GetAsync($"api/Feylings/GetFeyling/{id}");
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content.ReadFromJsonAsync<Feyling>();
        }
    }
}
