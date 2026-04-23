'use client';

import React, { useEffect } from 'react';
import '@/styles/recipies.css';

const BreakfastRecipes = () => {
  useEffect(() => {
    document.title = "Breakfast Recipes - Cocofina";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recipes">

      {/* BANNER */}
      <div className="recipes banner">
        <img src="/breakfasts.png" alt="Pure Sweetness In Every Sip" />
      </div>

      <div className="recipes content">

        <h2 className="recipes section-title">Breakfast</h2>

        {/* ===== ROW 1 ===== */}
        <div className="recipes cards-grid">

          {/* Pancakes */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/brkfst1.png" alt="Pancakes" />
            <div className="recipes card-title">Pancakes</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup flour</li>
                <li>1 tbsp Cocofina sugar</li>
                <li>1 cup milk</li>
                <li>1 egg (optional)</li>
                <li>1 tsp baking powder</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix all ingredients into a smooth batter.
                Cook on a pan until golden on both sides.</p>
              <p className="recipes card-tagline">Serve with fruits or honey.</p>
            </div>
          </div>

          {/* Oatmeal */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/brkfst2.png" alt="Oatmeal" />
            <div className="recipes card-title">Oatmeal</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup oats</li>
                <li>1 cup milk or water</li>
                <li>1 tbsp Cocofina sugar</li>
                <li>Fruits & nuts</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Cook oats in milk.
                Add Cocofina sugar and toppings.</p>
              <p className="recipes card-tagline">Quick and nutritious breakfast.</p>
            </div>
          </div>

          {/* French Toast */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/brkfst3.png" alt="French Toast" />
            <div className="recipes card-title">French Toast</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Bread slices</li>
                <li>1 egg</li>
                <li>1/2 cup milk</li>
                <li>1 tbsp Cocofina sugar</li>
                <li>Cinnamon</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix egg, milk, Cocofina sugar, cinnamon.
                Dip bread and cook on pan.</p>
              <p className="recipes card-tagline">Sweet and satisfying.</p>
            </div>
          </div>

        </div>

        {/* ===== ROW 2 ===== */}
        <div className="recipes cards-grid">

          {/* Banana Porridge */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/brkfst4.png" alt="Banana Porridge" />
            <div className="recipes card-title">Banana Porridge</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 mashed banana</li>
                <li>1/2 cup oats</li>
                <li>1 cup milk</li>
                <li>1 tbsp Cocofina sugar</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Cook oats and banana together.
                Add Cocofina sugar and mix.</p>
              <p className="recipes card-tagline">Naturally sweet energy meal.</p>
            </div>
          </div>

          {/* Smoothie Bowl */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/brkfst5.png" alt="Smoothie Bowl" />
            <div className="recipes card-title">Smoothie Bowl</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 banana</li>
                <li>1/2 cup yogurt</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Fruits & seeds</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Blend banana, yogurt, Cocofina sugar.
                Top with fruits and seeds.</p>
              <p className="recipes card-tagline">Healthy and filling.</p>
            </div>
          </div>

          {/* Sweet Poha */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/brkfst6.png" alt="Sweet Poha" />
            <div className="recipes card-title">Sweet Poha</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup poha</li>
                <li>2 tbsp Cocofina sugar</li>
                <li>1/4 cup grated coconut</li>
                <li>Nuts</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Soak poha lightly.
                Mix with Cocofina sugar, coconut, and nuts.</p>
              <p className="recipes card-tagline">Traditional quick breakfast.</p>
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

export default BreakfastRecipes;