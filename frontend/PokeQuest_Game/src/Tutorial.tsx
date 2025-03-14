import React, { useState } from 'react';
import styles from './Tutorial.module.css';
import Header from './modules/Header';
import Button from './modules/Button';

const cardData = ["Game", "Equip", "Feylings", "Inventory", "Summon"];

const cardDescriptions: Record<string, string> = {
  "Feylings": "On the Feylings site you can see all the Feylings in the game with their stats and type, in addition, upon clicking the View Ability button, you can see their Abilities.",
  "Inventory": "In the Inventory site, you can see your owned Feylings and your Items, also you can see how many items you have.",
  "Equip": "In the Equip site, you can equip the items you own to your Feylings. With items the game is much easier to win.",
  "Summon": "There are 2 types of chest, the Summon is for Feylings: 100 gems to open it, it is a critical point in the game because your starter Feylings are weaker then them. Also if you open a duplicate you will earn a lot of gems.",
  "Game": "You can select 1 of your owned Feyling to send them to battle to earn gems and lvl, upon losing a match your won't lose anything so don't be afraid to try again after some loses. The game may be hard in the early stages, but with a good strategy you can win easily."
};

const Tutorial = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <Header/>
      <div className={styles.cardHolder}>
        
        {cardData.map((card) => (
          <div 
            key={card} 
            className={styles.card} 
            onClick={() => setSelectedCard(card)} 
          > 
          {card}
          </div>
          
        ))}
        <Button route='/gamemenu' text='Back'></Button>
      </div>
      
      {/* Overlay */}
      {selectedCard && (
        <div className={styles.overlay} onClick={() => setSelectedCard(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedCard(null)}>X</button>
            <h2>{selectedCard}</h2>
            <p>{cardDescriptions[selectedCard]}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;