using Microsoft.AspNetCore.Identity;

namespace PokeQuestAPI.Models
{
    public class User : IdentityUser
    {
        public int UserLevel { get; set; }
        public int UserRole { get; set; } // 0 user, 1 admin
        public UserInventory Inventory { get; set; } // Each user has one inventory
        public int CoinAmount { get; set; } // Ingame currency amount
    }
}