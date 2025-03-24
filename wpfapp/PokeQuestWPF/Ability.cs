using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace PokeQuestWPF
{
    public class Ability
    {
        public int Id { get; set; }
        public int Damage { get; set; }
        public int? HealthPoint { get; set; } // Nullable, ignored if 0
        public int RechargeTime { get; set; }
    }

    public class AbilityService
    {
        private readonly HttpClient _httpClient;

        public AbilityService()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri("http://localhost:5130/") };
        }

        public async Task<Ability> GetAbilityByIdAsync(int id)
        {
            var response = await _httpClient.GetAsync($"api/Abilities/GetAbility/{id}");
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var ability = await response.Content.ReadFromJsonAsync<Ability>();
            if (ability != null && ability.HealthPoint == 0)
            {
                ability.HealthPoint = null; // Ignore HealthPoint if it's 0
            }
            return ability;
        }
    }
}
