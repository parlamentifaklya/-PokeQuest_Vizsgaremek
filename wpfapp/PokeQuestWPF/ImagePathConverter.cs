using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;
using System.Windows.Media.Imaging;

namespace PokeQuestWPF
{
    public class ImagePathConverter : IValueConverter
    {
        private const string BaseUrl = "http://localhost:5130/api/";

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {

            if (value == null)
                return null;

            string relativePath = value.ToString();
            string fullImageUrl = BaseUrl  +  relativePath.Replace("\\", "/");

            return new BitmapImage(new Uri(fullImageUrl));
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return null; // Not used in this scenario
        }
    }
}
