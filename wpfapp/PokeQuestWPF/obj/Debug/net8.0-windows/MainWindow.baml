   M S B A M L   `   `   `  ����G  CPokeQuestWPF, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null+clr-namespace:PokeQuestWPFPokeQuestWPF  5   	       PokeQuestWPF.MainWindow   5   	   W SPresentationCore, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35F 9http://schemas.microsoft.com/winfx/2006/xaml/presentation     5   	   R NSystem.Xaml, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5   	   @d2http://schemas.microsoft.com/expression/blend/2008     5   	   Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5   	   ,localclr-namespace:PokeQuestWPF     5   	     � Title$  BattlePreview��5   	   $	��800��6   $	��800��6,    � 	Resources 5
      %   PokeQuestWPF.ImagePathConverter   ImagePathConverter��%   &	          5   
   6#   5      .��5      �  � ColumnDefinitions 5   
   �� 5      $��3* �6   �� 5      $��* �6   �� 5      $��3* �6    � RowDefinitions 5   
   �� 5      $��* �6   6)   �� 5      $��7* �6   6*   .+�5   
   �� -   5        $��FeylingListBox1��5   /   $��1��6   $��0��6   ��5      �� 5      .R�5      ��  �� Orientation$ 
Horizontal=�6!   $��Center=�6:   .+�5      �� $��50��6f   $��50��6q   $��5q�6}   ��6    �� *Img+ �� 	Converter# [  6}   �� 5      $��16(�6:   $��Center=�6H   ��6$   �� *Name+6H   5       5!      5#      �� 5&   
   -   5        $��FeylingListBox2��5&   /   $��1��6   $��2��6   ��5'      �� 5(      .R�5)      �� $ 
Horizontal=�6!   $��Center=�6:   .+�5*      �� $��50��6f   $��50��6q   $��5q�6}   ��6    �� *Img+# [  6}   �� 5+      $��16(�6:   $��Center=�6H   ��6$   �� *Name+6H   5,      5-      5/      � 52   
   $��1��6    53      �� 54      $��2* �6#   60   �� 55      $��* �6#   6/    58      �� 59      6"   �� 5:      6"   �� 5;      6"   .+�5>      �� -   5        $��1��5>      $��1��6%   $
��Auto��62   $
��Auto��6?   .��5?      �� $
��Auto��6   $��Assets/info_icon.png��6'   5@      �� 5A      -   5        $��BattleButton��5A   M   $��0��6   $��1��6%   $
��Auto��62   $
��Auto��6?   $��Battle��6a   ${�False��6�   5B      �� 5E   
   $��1��6   $��1��6!   $��Center=�61   $��Center=�6L   $��VS��6i   $��80(�6s   $��Arial)�6�   6�   5F      5G      