using System.ComponentModel.DataAnnotations;

namespace PokeQuestAPI.Models
{
    public class Item
    {
        [Key] // This attribute specifies that Id is the primary key
        public int Id { get; set; }

        [Required] // This attribute specifies that Name is required
        public string Name { get; set; }

        public string Description { get; set; }
        public string Img { get; set; }
        public string ItemAbility { get; set; }

        public int Rarity { get; set; }
    }
}
