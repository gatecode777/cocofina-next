'use client';

import React, { useEffect } from 'react';
import '@/styles/recipies.css';

const DailyBeverages = () => {
  useEffect(() => {
    document.title = "Daily Beverages - Cocofina Recipes";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recipes">

      {/* BANNER */}
      <div className="recipes banner">
        <img src="/dailybeverages.png" alt="Pure Sweetness In Every Sip" />
      </div>

      <div className="recipes content">

        <h2 className="recipes section-title">Daily Beverages</h2>

        {/* ===== ROW 1 ===== */}
        <div className="recipes cards-grid">

          {/* Milk Tea */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB1.png" alt="Milk Tea" />
            <div className="recipes card-title">Milk Tea</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup water</li>
                <li>1/2 cup milk</li>
                <li>1 tsp tea leaves</li>
                <li>1–2 tsp Cocofina sugar</li>
                <li>1 small piece ginger (optional)</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Boil water with tea leaves and ginger. Add milk and simmer
                for 2–3 minutes. Add coconut sugar, mix well, and strain.</p>
              <p className="recipes card-tagline">Perfect for morning refreshment.</p>
            </div>
          </div>

          {/* Lemon Water (dark) */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB2.png" alt="Lemon Water" />
            <div className="recipes card-title">Lemon Water</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 glass warm water</li>
                <li>1 tbsp lemon juice</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Pinch of black salt</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix everything well. Drink on empty stomach.</p>
              <p className="recipes card-tagline">Great for detox and digestion.</p>
            </div>
          </div>

          {/* Cold Coffee */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB3.png" alt="Cold Coffee" />
            <div className="recipes card-title">Cold Coffee</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup cold milk</li>
                <li>1 tsp coffee powder</li>
                <li>1–2 tsp Cocofina sugar</li>
                <li>Ice cubes</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Blend all ingredients until frothy. Serve chilled.</p>
              <p className="recipes card-tagline">Natural energy drink.</p>
            </div>
          </div>

        </div>

        {/* ===== ROW 2 ===== */}
        <div className="recipes cards-grid">

          {/* Coconut Water */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB4.png" alt="Coconut Water" />
            <div className="recipes card-title">Coconut Water Drink</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 glass fresh coconut water</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Few mint leaves</li>
                <li>Ice</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix all ingredients and stir well. Serve chilled.</p>
              <p className="recipes card-tagline">Ultra-refreshing summer drink.</p>
            </div>
          </div>

          {/* Herbal Tea (dark) */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB5.png" alt="Herbal Tea" />
            <div className="recipes card-title">Herbal Tea</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup water</li>
                <li>Tulsi leaves / mint leaves</li>
                <li>1 tsp coconut sugar</li>
                <li>Few drops lemon juice</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Boil herbs in water for 5 minutes. Add coconut sugar and
                lemon. Strain and serve warm.</p>
              <p className="recipes card-tagline">Boosts immunity.</p>
            </div>
          </div>

          {/* Mango Smoothie */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB6.png" alt="Mango Smoothie" />
            <div className="recipes card-title">Mango Smoothie</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 ripe mango</li>
                <li>1 cup milk or yogurt</li>
                <li>1–2 tsp Cocofina sugar</li>
                <li>Ice cubes</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Blend all ingredients until smooth. Serve chilled.</p>
              <p className="recipes card-tagline">Perfect summer breakfast drink.</p>
            </div>
          </div>

        </div>

        {/* ===== ROW 3 ===== */}
        <div className="recipes cards-grid">

          {/* Banana Shake */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB7.png" alt="Banana Shake" />
            <div className="recipes card-title">Banana Shake</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 banana</li>
                <li>1 cup milk</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Pinch cinnamon (optional)</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Blend everything well. Serve immediately.</p>
              <p className="recipes card-tagline">Energy booster.</p>
            </div>
          </div>

          {/* Buttermilk (dark) */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB8.png" alt="Buttermilk" />
            <div className="recipes card-title">Buttermilk</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup curd</li>
                <li>1/2 cup water</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Pinch roasted cumin powder</li>
                <li>Salt to taste</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Blend all ingredients. Serve chilled.</p>
              <p className="recipes card-tagline">Good for digestion.</p>
            </div>
          </div>

          {/* Hot Chocolate */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/DB9.png" alt="Hot Chocolate" />
            <div className="recipes card-title">Hot Chocolate</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup milk</li>
                <li>1 tbsp cocoa powder</li>
                <li>1–2 tsp Cocofina sugar</li>
                <li>1/4 tsp vanilla extract (optional)</li>
                <li>Pinch of cinnamon (optional)</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Heat milk in a pan (do not boil too much). Add cocoa powder
                and mix well. Stir in coconut sugar until dissolved. Add vanilla and cinnamon. Serve hot.
              </p>
              <p className="recipes card-tagline">Good for digestion.</p>
            </div>
          </div>

        </div>

        {/* NOTE */}
        <p className="recipes note">
          <strong>Note :</strong> If you add coconut sugar while the milk is boiling, it may cause the milk to
          curdle. Therefore, always heat the milk first and add
          coconut sugar only after removing it from heat or at the very end.
        </p>

      </div>
    </div>
  );
};

export default DailyBeverages;