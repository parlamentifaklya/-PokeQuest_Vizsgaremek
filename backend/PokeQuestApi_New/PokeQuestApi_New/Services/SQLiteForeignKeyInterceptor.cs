using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;

namespace PokeQuestApi_New.Services
{
    public class SQLiteForeignKeyInterceptor : IDbCommandInterceptor
    {
        // Intercepts commands and ensures PRAGMA foreign_keys = ON for SQLite
        public Task<InterceptionResult<int>> CommandExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            // Check if this is a SQL command that should trigger foreign key enforcement
            if (command.CommandText.StartsWith("INSERT", System.StringComparison.OrdinalIgnoreCase) ||
                command.CommandText.StartsWith("UPDATE", System.StringComparison.OrdinalIgnoreCase) ||
                command.CommandText.StartsWith("DELETE", System.StringComparison.OrdinalIgnoreCase))
            {
                // Add PRAGMA foreign_keys = ON to enforce foreign key constraints
                command.CommandText = "PRAGMA foreign_keys = ON;" + System.Environment.NewLine + command.CommandText;
            }

            // Continue with command execution
            return Task.FromResult(result);
        }

        // Required to implement other methods, but we'll leave them unmodified
        public Task<InterceptionResult<int>> CommandExecutedAsync(
            DbCommand command,
            CommandExecutedEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result);

        public Task<DbDataReader> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result.Result);

        public Task<DbDataReader> ReaderExecutedAsync(
            DbCommand command,
            CommandExecutedEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result.Result);

        public Task<object> ScalarExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<object> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result.Result);

        public Task<object> ScalarExecutedAsync(
            DbCommand command,
            CommandExecutedEventData eventData,
            InterceptionResult<object> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result.Result);

        public Task<int> NonQueryExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result.Result);

        public Task<int> NonQueryExecutedAsync(
            DbCommand command,
            CommandExecutedEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(result.Result);
    }
}
