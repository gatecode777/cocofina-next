'use client';

import React, { useEffect } from 'react';
import '@/styles/recipies.css';

const EverydayCooking = () => {
  useEffect(() => {
    document.title = "Everyday Cooking - Cocofina Recipes";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recipes">

      {/* BANNER */}
      <div className="recipes banner">
        <img
          src="/evryday.png"
          alt="Pure Sweetness In Every Sip"
        />
      </div>

      <div className="recipes content">
        <h2 className="recipes section-title">Everyday Cooking</h2>

        {/* ===== ROW 1 ===== */}
        <div className="recipes cards-grid">

          {/* Sweet Dal */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday1.png"
              alt="Sweet Dal"
            />
            <div className="recipes card-title">Sweet Dal</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup cooked dal (toor/moong)</li>
                <li>1 tbsp Cocofina sugar</li>
                <li>Salt, turmeric</li>
                <li>Tempering</li>
                <li>(mustard seeds, cumin, curry leaves)</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Prepare dal as usual. Add Cocofina sugar and mix well. Add
                tempering on top.
              </p>
              <p className="recipes card-tagline">
                Slight sweet touch like Gujarati-style dal.
              </p>
            </div>
          </div>

          {/* Stir-Fry Vegetables */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday2.png"
              alt="Stir-Fry Vegetables"
            />
            <div className="recipes card-title">Stir-Fry Vegetables</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Mixed vegetables</li>
                <li>1 tsp Cocofina sugar</li>
                <li>1 tbsp soy sauce</li>
                <li>Garlic, oil</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Stir-fry vegetables. Add soy sauce and Cocofina sugar. Toss well.
              </p>
              <p className="recipes card-tagline">Balanced sweet-savory flavor.</p>
            </div>
          </div>

          {/* Fried Rice */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday3.png"
              alt="Fried Rice"
            />
            <div className="recipes card-title">Fried Rice</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Cooked rice</li>
                <li>Vegetables</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Soy sauce, pepper</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Stir-fry veggies. Add rice, sauces, and Cocofina sugar. Mix well.
              </p>
              <p className="recipes card-tagline">
                Restaurant-style taste at home.
              </p>
            </div>
          </div>
        </div>

        {/* ===== ROW 2 ===== */}
        <div className="recipes cards-grid">

          {/* Glazed Paneer */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday4.png"
              alt="Glazed Paneer"
            />
            <div className="recipes card-title">Glazed Paneer</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Paneer</li>
                <li>1 tbsp Cocofina sugar</li>
                <li>1 tbsp soy sauce</li>
                <li>Garlic, ginger</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Cook paneer. Add sauces and Cocofina sugar. Cook till glazed.
              </p>
              <p className="recipes card-tagline">Sweet & savory dish.</p>
            </div>
          </div>

          {/* Salad Dressing */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday5.png"
              alt="Salad Dressing"
            />
            <div className="recipes card-title">Salad Dressing</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>2 tbsp olive oil</li>
                <li>1 tsp coconut sugar</li>
                <li>1 tbsp lemon juice</li>
                <li>Salt & pepper</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix all ingredients well.</p>
              <p className="recipes card-tagline">Perfect for fresh salads.</p>
            </div>
          </div>

          {/* Tomato Chutney */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday6.png"
              alt="Tomato Chutney"
            />
            <div className="recipes card-title">Tomato Chutney</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>2 tomatoes</li>
                <li>1 tbsp Cocofina sugar</li>
                <li>Garlic, chili</li>
                <li>Oil, mustard seeds</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Cook tomatoes with spices. Add Cocofina sugar and simmer.
              </p>
              <p className="recipes card-tagline">Sweet-spicy chutney.</p>
            </div>
          </div>
        </div>

        {/* ===== ROW 3 ===== */}
        <div className="recipes cards-grid">

          {/* Curry (Gravy Base) */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday7.png"
              alt="Curry"
            />
            <div className="recipes card-title">Curry (Gravy Base)</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Onion-tomato gravy</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Spices (garam masala, turmeric)</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Prepare curry base. Add Cocofina sugar to balance acidity.
              </p>
              <p className="recipes card-tagline">Enhances taste naturally.</p>
            </div>
          </div>

          {/* Toast Spread */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday8.png"
              alt="Toast Spread"
            />
            <div className="recipes card-title">Toast Spread</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Butter</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Cinnamon</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix and spread on toast.</p>
              <p className="recipes card-tagline">Quick sweet breakfast/snack.</p>
            </div>
          </div>

          {/* Roasted Potatoes */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img
              className="recipes card-img"
              src="/evryday9.png"
              alt="Roasted Potatoes"
            />
            <div className="recipes card-title">Roasted Potatoes</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>Boiled potatoes</li>
                <li>1 tsp Cocofina sugar</li>
                <li>Oil, spices</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">
                Roast potatoes in pan. Add Cocofina sugar at end for caramel
                coating.
              </p>
              <p className="recipes card-tagline">Crispy & slightly sweet.</p>
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

export default EverydayCooking;