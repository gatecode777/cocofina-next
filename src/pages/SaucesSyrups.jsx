'use client';

import React, { useEffect } from 'react';
import '@/styles/recipies.css';

const SaucesSyrups = () => {
  useEffect(() => {
    document.title = "Sauces & Homemade Syrups - Cocofina Recipes";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recipes">

      {/* BANNER */}
      <div className="recipes banner">
        <img src="/s&h.webp" alt="Pure Sweetness In Every Sip" />
      </div>

      <div className="recipes content">

        <h2 className="recipes section-title">Sauces & Homemade Syrups</h2>

        {/* ===== ROW 1 ===== */}
        <div className="recipes cards-grid">

          {/* Caramel Sauce */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h1.png" alt="Caramel Sauce" />
            <div className="recipes card-title">Caramel Sauce</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup Cocofina sugar</li>
                <li>2 tbsp butter</li>
                <li>1/4 cup cream</li>
                <li>Pinch salt</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Melt Cocofina sugar on low flame. Add butter and mix. Slowly add
                cream and stir till smooth.
              </p>
              <p className="recipes card-tagline">
                Perfect for pancakes, ice cream, cakes.
              </p>
            </div>
          </div>

          {/* Chocolate Syrup */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h2.png" alt="Chocolate Syrup" />
            <div className="recipes card-title">Chocolate Syrup</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup cocoa powder</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1 cup water</li>
                <li>1 tsp vanilla</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Mix cocoa, Cocofina sugar, and water. Cook until thick. Add
                vanilla and cool.
              </p>
              <p className="recipes card-tagline">
                Great for milk, desserts, and coffee.
              </p>
            </div>
          </div>

          {/* Strawberry Sauce */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h3.png" alt="Strawberry Sauce" />
            <div className="recipes card-title">Strawberry Sauce</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup strawberries</li>
                <li>2 tbsp Cocofina sugar</li>
                <li>1 tsp lemon juice</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Cook all ingredients until soft. Mash or blend for smooth
                texture.
              </p>
              <p className="recipes card-tagline">
                Topping for cheesecake & pancakes.
              </p>
            </div>
          </div>

        </div>

        {/* ===== ROW 2 ===== */}
        <div className="recipes cards-grid">

          {/* Lemon Syrup */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h4.png" alt="Lemon Syrup" />
            <div className="recipes card-title">Lemon Syrup</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup Cocofina sugar</li>
                <li>1/2 cup water</li>
                <li>2 tbsp lemon juice</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Heat sugar and water. Add lemon juice after cooling.
              </p>
              <p className="recipes card-tagline">Great for drinks & soda.</p>
            </div>
          </div>

          {/* Orange Glaze */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h5.png" alt="Orange Glaze" />
            <div className="recipes card-title">Orange Glaze</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup orange juice</li>
                <li>2 tbsp Cocofina sugar</li>
                <li>1 tsp cornflour</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Cook all ingredients until thick.
              </p>
              <p className="recipes card-tagline">Perfect for cakes & pastries.</p>
            </div>
          </div>

          {/* Pancake Syrup */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h6.png" alt="Pancake Syrup" />
            <div className="recipes card-title">Pancake Syrup</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup Cocofina sugar</li>
                <li>1/2 cup water</li>
                <li>1/2 tsp vanilla</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Heat sugar and water until syrup forms. Add vanilla.
              </p>
              <p className="recipes card-tagline">
                Healthy maple syrup alternative.
              </p>
            </div>
          </div>

        </div>

        {/* ===== ROW 3 ===== */}
        <div className="recipes cards-grid">

          {/* Coconut Sauce */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h7.png" alt="Coconut Sauce" />
            <div className="recipes card-title">Coconut Sauce</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup coconut milk</li>
                <li>2 tbsp Cocofina sugar</li>
                <li>Pinch salt</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Heat all ingredients until slightly thick.
              </p>
              <p className="recipes card-tagline">
                Best with desserts and pancakes.
              </p>
            </div>
          </div>

          {/* Apple Cinnamon Syrup */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h8.png" alt="Apple Cinnamon Syrup" />
            <div className="recipes card-title">Apple Cinnamon Syrup</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup apple juice</li>
                <li>2 tbsp Cocofina sugar</li>
                <li>1/2 tsp cinnamon</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Simmer until slightly thick.
              </p>
              <p className="recipes card-tagline">Perfect for waffles & oatmeal.</p>
            </div>
          </div>

          {/* Tea Syrup */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/s&h9.png" alt="Tea Syrup" />
            <div className="recipes card-title">Tea Syrup</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup water</li>
                <li>2 tsp tea leaves</li>
                <li>2 tbsp Cocofina sugar</li>
                <li>Cardamom, ginger</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Boil all ingredients. Strain and store.
              </p>
              <p className="recipes card-tagline">Use for instant chai anytime.</p>
            </div>
          </div>

        </div>

        {/* NOTE */}
        <p className="recipes note">
          <strong>Note :</strong> If you add coconut sugar while the milk is
          boiling, it may cause the milk to curdle. Therefore, always heat the
          milk first and add coconut sugar only after removing it from heat or
          at the very end.
        </p>

      </div>
    </div>
  );
};

export default SaucesSyrups;