using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Models;
using System;

namespace PokeQuestApi_New.Data
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
        public DbSet<UserInventory> UserInventories { get; set; } // Add UserInventory DbSet

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Call the base method to configure Identity

            // Define primary keys
            modelBuilder.Entity<Ability>()
                .HasKey(a => a.Id); // Primary key for Ability

            modelBuilder.Entity<Feyling>()
                .HasKey(f => f.Id); // Primary key for Feyling

            modelBuilder.Entity<Item>()
                .HasKey(i => i.Id); // Primary key for Item

            modelBuilder.Entity<User>()
                .HasKey(u => u.Id); // IdentityUser already has an Id property


            modelBuilder.Entity<OwnedFeyling>()
                .HasKey(ow => ow.Id); // Primary key for OwnedFeyling

            modelBuilder.Entity<OwnedItem>()
                .HasKey(oi => oi.Id); // Primary key for OwnedItem

            modelBuilder.Entity<Models.Type>()
                .HasKey(t => t.Id); // Primary key for Type

            modelBuilder.Entity<UserInventory>()
                .HasKey(ui => ui.Id); // Primary key for UserInventory

            // Define relations for Ability
            modelBuilder.Entity<Ability>()
                .HasOne(a => a.Type) // Ability has one Type
                .WithMany() // Type can have many Abilities
                .HasForeignKey(a => a.TypeId); // Foreign key in Ability

            // Define relations for Feyling
            modelBuilder.Entity<Feyling>()
                .HasOne(f => f.Type) // Feyling has one Type
                .WithMany() // Type can have many Feylings
                .HasForeignKey(f => f.TypeId); // Foreign key in Feyling

            modelBuilder.Entity<Feyling>()
                .HasOne(f => f.Ability) // Feyling has one Ability
                .WithMany() // Ability can have many Feylings
                .HasForeignKey(f => f.AbilityId); // Foreign key in Feyling

            modelBuilder.Entity<Feyling>()
                .HasOne(f => f.Item) // Feyling has one Item
                .WithMany() // Item can have many Feylings
                .HasForeignKey(f => f.ItemId); // Foreign key in Feyling

            modelBuilder.Entity<Feyling>()
                .HasOne(f => f.WeakAgainst) // Feyling has one WeakAgainst Type
                .WithMany() // Type can have many Feylings that are weak against it
                .HasForeignKey(f => f.WeakAgainstId); // Foreign key in Feyling

            modelBuilder.Entity<Feyling>()
                .HasOne(f => f.StrongAgainst) // Feyling has one StrongAgainst Type
                .WithMany() // Type can have many Feylings that are strong against it
                .HasForeignKey(f => f.StrongAgainstId); // Foreign key in Feyling

            // Define relationships for UserInventory
            modelBuilder.Entity<UserInventory>()
                .HasOne(ui => ui.User) // UserInventory has one User
                .WithOne(u => u.Inventory) // User has one UserInventory
                .HasForeignKey<UserInventory>(ui => ui.UserId) // Foreign key in UserInventory
                .OnDelete(DeleteBehavior.Cascade); // Ensure that deleting the user deletes the inventory

            // Define relationships for OwnedFeyling
            modelBuilder.Entity<OwnedFeyling>()
                .HasOne(ow => ow.UserInventory) // OwnedFeyling has one UserInventory
                .WithMany(ui => ui.OwnedFeylings) // UserInventory can have many OwnedFeylings
                .HasForeignKey(ow => ow.UserInventoryId) // Foreign key in OwnedFeyling
                .OnDelete(DeleteBehavior.Cascade);

            // Define relationships for OwnedItem
            modelBuilder.Entity<OwnedItem>()
                .HasOne(oi => oi.UserInventory) // OwnedItem has one UserInventory
                .WithMany(ui => ui.OwnedItems) // UserInventory can have many OwnedItems
                .HasForeignKey(oi => oi.UserInventoryId) // Foreign key in OwnedItem
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}