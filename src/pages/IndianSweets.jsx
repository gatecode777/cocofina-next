'use client';

import React, { useEffect } from 'react';
import '@/styles/recipies.css';

const IndianSweets = () => {
  useEffect(() => {
    document.title = "Indian Sweets - Cocofina Recipes";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recipes">

      {/* BANNER */}
      <div className="recipes banner">
        <img src="/indiansweets.png" alt="Pure Sweetness In Every Sip" />
      </div>

      <div className="recipes content">

        <h2 className="recipes section-title">Indian Sweets</h2>

        {/* ===== ROW 1 ===== */}
        <div className="recipes cards-grid">

          {/* Besan Ladoo */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/IS1.png" alt="Besan Ladoo" />
            <div className="recipes card-title">Besan Ladoo</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup besan (gram flour)</li>
                <li>1/2 cup ghee</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>Cardamom powder</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Roast besan in ghee on low flame until golden.
                Let it cool slightly, then add Cocofina sugar & cardamom.
                Shape into ladoos.</p>
              <p className="recipes card-tagline">Classic festive sweet with a healthy upgrade.</p>
            </div>
          </div>

          {/* Atta Halwa */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/IS2.png" alt="Atta Halwa" />
            <div className="recipes card-title">Atta Halwa</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup wheat flour</li>
                <li>1/2 cup ghee</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>2 cups water</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Roast flour in ghee until brown.
                Add water carefully and stir.
                Add Cocofina sugar and cook till thick.</p>
              <p className="recipes card-tagline">Rich and traditional prasad-style sweet.</p>
            </div>
          </div>

          {/* Til Ladoo */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/IS3.png" alt="Til Ladoo" />
            <div className="recipes card-title">Til Ladoo</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup sesame seeds</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>2 tbsp ghee</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Roast sesame seeds.
                Melt Cocofina sugar with ghee.
                Mix and shape ladoos.</p>
              <p className="recipes card-tagline">Perfect for winters.</p>
            </div>
          </div>

        </div>

        {/* ===== ROW 2 ===== */}
        <div className="recipes cards-grid">

          {/* Nariyal Barfi */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/IS4.png" alt="Nariyal Barfi" />
            <div className="recipes card-title">Nariyal Barfi</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup grated coconut</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1/4 cup milk</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Cook all ingredients together.
                Spread in tray and set.</p>
              <p className="recipes card-tagline">Quick and festive dessert.</p>
            </div>
          </div>

          {/* Rava Sheera */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/IS5.png" alt="Rava Sheera" />
            <div className="recipes card-title">Rava Sheera</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup semolina (rava)</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1/2 cup ghee</li>
                <li>2 cups water or milk</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Roast rava in ghee.
                Add water/milk and cook.
                Add Cocofina sugar and mix.</p>
              <p className="recipes card-tagline">Soft, aromatic sweet.</p>
            </div>
          </div>

          {/* Peanut Chikki */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/IS6.png" alt="Peanut Chikki" />
            <div className="recipes card-title">Peanut Chikki</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup roasted peanuts</li>
                <li>1/2 cup Cocofina sugar</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Melt Cocofina sugar till sticky.
                Add peanuts and mix.
                Spread and cut.</p>
              <p className="recipes card-tagline">Crunchy snack sweet.</p>
            </div>
          </div>

        </div>

        {/* NOTE */}
        <p className="recipes note">
          <strong>Note :</strong> If you add coconut sugar while the milk is boiling, it may cause the milk to curdle.
          Therefore, always heat the milk first and add
          coconut sugar only after removing it from heat or at the very end.
        </p>

      </div>
    </div>
  );
};

export default IndianSweets;