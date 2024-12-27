using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PokeQuestAPI.Models;

namespace PokeQuestAPI.Data
{
    public class PokeQuestApiContext : IdentityDbContext<User>
    {
        public PokeQuestApiContext(DbContextOptions<PokeQuestApiContext> options) : base(options)
        {
            
        }

        public DbSet<Ability> Abilities { get; set; }
        public DbSet<Feyling> Feylings { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<OwnedFeyling> OwnedFeylings { get; set; }
        public DbSet<OwnedItem> OwnedItems { get; set; }
        public DbSet<Models.Type> Types { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
