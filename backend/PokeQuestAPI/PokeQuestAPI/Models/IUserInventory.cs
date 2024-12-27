namespace PokeQuestAPI.Models
{
    public interface IUserInventory
    {
        public List<OwnedFeyling> ownedFeylings { get; set; }
        public List<OwnedItem> UserItems { get; set; }
    }
}
