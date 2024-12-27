using Microsoft.AspNetCore.Identity;

namespace PokeQuestAPI.Models
{
    public class User : IdentityUser
    {
        public int UserLevel { get; set; }
        public List<IUserInventory>? Inventory { get; set; }
        public int CoinAmount { get; set; }
    }
}
