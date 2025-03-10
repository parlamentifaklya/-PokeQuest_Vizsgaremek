using System;
using System.Collections.Generic;
using System.Windows;

namespace PokeQuestWPF
{
    public partial class MainWindow : Window
    {
        private readonly FeylingService _feylingService;

        public MainWindow()
        {
            InitializeComponent();
            _feylingService = new FeylingService();
        }

        private async void LoadFeylings_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_feylingService == null)
                {
                    MessageBox.Show("FeylingService is not initialized!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                List<Feyling> feylings = await _feylingService.GetAllFeylingsAsync();
                FeylingListBox1.ItemsSource = feylings;
                FeylingListBox2.ItemsSource = feylings;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // Check if same Feyling is selected in both lists and enable/disable Battle button
        private void FeylingListBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            // Ensure that both Feylings are selected
            if (FeylingListBox1.SelectedItem != null && FeylingListBox2.SelectedItem != null)
            {
                var selectedFeyling1 = FeylingListBox1.SelectedItem as Feyling;
                var selectedFeyling2 = FeylingListBox2.SelectedItem as Feyling;

                // Check if same Feyling is selected in both lists
                if (selectedFeyling1.Id == selectedFeyling2.Id)
                {
                    MessageBox.Show("You cannot select the same Feyling for both columns.", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                    BattleButton.IsEnabled = false; // Disable Battle button if same Feyling is selected
                }
                else
                {
                    BattleButton.IsEnabled = true; // Enable Battle button if different Feylings are selected
                }
            }
            else
            {
                BattleButton.IsEnabled = false; // Disable Battle button if not both Feylings are selected
            }
        }

        // Battle button logic
        private void Battle_Click(object sender, RoutedEventArgs e)
        {
            // Check if two Feylings are selected
            if (FeylingListBox1.SelectedItem == null || FeylingListBox2.SelectedItem == null)
            {
                MessageBox.Show("Please select one Feyling from each list to battle.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            // Cast the selected items to Feyling
            Feyling feyling1 = FeylingListBox1.SelectedItem as Feyling;
            Feyling feyling2 = FeylingListBox2.SelectedItem as Feyling;

            // Start battle simulation
            string result = Battle(feyling1, feyling2);

            // Show the result in a MessageBox
            MessageBox.Show(result, "Battle Result", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        // Battle logic (simulating turn-based battle)
        private string Battle(Feyling feyling1, Feyling feyling2)
        {
            // Copy the HPs to avoid modifying the original objects
            int feyling1Hp = feyling1.Hp;
            int feyling2Hp = feyling2.Hp;

            int turn = 1;
            while (feyling1Hp > 0 && feyling2Hp > 0)
            {
                if (turn % 2 == 1) // Feyling 1 attacks first
                {
                    feyling2Hp -= feyling1.Atk;
                    if (feyling2Hp <= 0)
                    {
                        return $"{feyling1.Name} wins after {turn} turns!";
                    }
                }
                else // Feyling 2 attacks
                {
                    feyling1Hp -= feyling2.Atk;
                    if (feyling1Hp <= 0)
                    {
                        return $"{feyling2.Name} wins after {turn} turns!";
                    }
                }

                turn++; // Alternate turns
            }

            return "Battle ended with no winner."; // Shouldn't reach here under normal circumstances
        }
    }
}
