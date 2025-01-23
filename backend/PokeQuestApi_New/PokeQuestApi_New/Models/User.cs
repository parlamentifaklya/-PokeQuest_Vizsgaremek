using Microsoft.AspNetCore.Identity;

namespace PokeQuestApi_New.Models
{
    public class User : IdentityUser
    {
        public int UserLevel { get; set; }
        public UserInventory Inventory { get; set; } // Each user has one inventory
        public int CoinAmount { get; set; } // Ingame currency amount
    }
}