using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeQuestAPI.Migrations
{
    /// <inheritdoc />
    public partial class mssqllocal_migration_542 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OwnedFeylings_UserInventory_UserInventoryId",
                table: "OwnedFeylings");

            migrationBuilder.DropForeignKey(
                name: "FK_OwnedItems_UserInventory_UserInventoryId",
                table: "OwnedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_UserInventory_AspNetUsers_UserId",
                table: "UserInventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserInventory",
                table: "UserInventory");

            migrationBuilder.RenameTable(
                name: "UserInventory",
                newName: "UserInventories");

            migrationBuilder.RenameIndex(
                name: "IX_UserInventory_UserId",
                table: "UserInventories",
                newName: "IX_UserInventories_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserInventories",
                table: "UserInventories",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_OwnedItems_ItemId",
                table: "OwnedItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OwnedFeylings_FeylingId",
                table: "OwnedFeylings",
                column: "FeylingId");

            migrationBuilder.AddForeignKey(
                name: "FK_OwnedFeylings_Feylings_FeylingId",
                table: "OwnedFeylings",
                column: "FeylingId",
                principalTable: "Feylings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OwnedFeylings_UserInventories_UserInventoryId",
                table: "OwnedFeylings",
                column: "UserInventoryId",
                principalTable: "UserInventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OwnedItems_Items_ItemId",
                table: "OwnedItems",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OwnedItems_UserInventories_UserInventoryId",
                table: "OwnedItems",
                column: "UserInventoryId",
                principalTable: "UserInventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserInventories_AspNetUsers_UserId",
                table: "UserInventories",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OwnedFeylings_Feylings_FeylingId",
                table: "OwnedFeylings");

            migrationBuilder.DropForeignKey(
                name: "FK_OwnedFeylings_UserInventories_UserInventoryId",
                table: "OwnedFeylings");

            migrationBuilder.DropForeignKey(
                name: "FK_OwnedItems_Items_ItemId",
                table: "OwnedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OwnedItems_UserInventories_UserInventoryId",
                table: "OwnedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_UserInventories_AspNetUsers_UserId",
                table: "UserInventories");

            migrationBuilder.DropIndex(
                name: "IX_OwnedItems_ItemId",
                table: "OwnedItems");

            migrationBuilder.DropIndex(
                name: "IX_OwnedFeylings_FeylingId",
                table: "OwnedFeylings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserInventories",
                table: "UserInventories");

            migrationBuilder.RenameTable(
                name: "UserInventories",
                newName: "UserInventory");

            migrationBuilder.RenameIndex(
                name: "IX_UserInventories_UserId",
                table: "UserInventory",
                newName: "IX_UserInventory_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserInventory",
                table: "UserInventory",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OwnedFeylings_UserInventory_UserInventoryId",
                table: "OwnedFeylings",
                column: "UserInventoryId",
                principalTable: "UserInventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OwnedItems_UserInventory_UserInventoryId",
                table: "OwnedItems",
                column: "UserInventoryId",
                principalTable: "UserInventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserInventory_AspNetUsers_UserId",
                table: "UserInventory",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
