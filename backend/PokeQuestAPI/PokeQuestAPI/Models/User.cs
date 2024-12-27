using Microsoft.AspNetCore.Identity;

namespace PokeQuestAPI.Models
{
    public class User : IdentityUser
    {
        public int UserLevel { get; set; }
        public List<object>? Inventory { get; set; }
        public int CoinAmount { get; set; }
    }
}
