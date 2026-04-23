'use client';

import React, { useEffect } from 'react';
import '@/styles/recipies.css';

const BakingDesserts = () => {
  useEffect(() => {
    document.title = "Baking & Desserts - Cocofina Recipes";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="recipes">

      {/* BANNER */}
      <div className="recipes banner">
        <img src="/Baking&Desserts.png" alt="Pure Sweetness In Every Sip" />
      </div>

      <div className="recipes content">

        <h2 className="recipes section-title">Baking & Desserts</h2>

        {/* ===== ROW 1 ===== */}
        <div className="recipes cards-grid">

          {/* Cookies */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD1.png" alt="Cookies" />
            <div className="recipes card-title">Cookies</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup flour</li>
                <li>1/2 cup butter</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1 egg</li>
                <li>1/2 tsp baking soda</li>
                <li>1 tsp vanilla extract</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Cream butter + Cocofina sugar. Add egg & vanilla. Mix dry ingredients and combine. Shape cookies and bake at 180°C for 10–12 mins.</p>
              <p className="recipes card-tagline">Soft, chewy, and naturally sweet.</p>
            </div>
          </div>

          {/* Chocolate Cake */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD2.png" alt="Chocolate Cake" />
            <div className="recipes card-title">Chocolate Cake</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1½ cup flour</li>
                <li>1 cup Cocofina sugar</li>
                <li>1/2 cup cocoa powder</li>
                <li>1 tsp baking powder</li>
                <li>1/2 cup oil</li>
                <li>1 cup milk</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix all dry ingredients. Add wet ingredients and whisk. Pour into tin and bake at 180°C for 30–35 mins.</p>
              <p className="recipes card-tagline">Rich chocolate flavor with a caramel touch.</p>
            </div>
          </div>

          {/* Muffins */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD3.png" alt="Muffins" />
            <div className="recipes card-title">Muffins</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup flour</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1/2 cup milk</li>
                <li>1/4 cup oil</li>
                <li>1 tsp baking powder</li>
                <li>Fruits or chocolate chips (optional)</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix all ingredients. Fill muffin cups. Bake at 180°C for 20–25 mins.</p>
              <p className="recipes card-tagline">Perfect for breakfast or snacks.</p>
            </div>
          </div>

        </div>

        {/* ===== ROW 2 ===== */}
        <div className="recipes cards-grid">

          {/* Caramel Pudding */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD4.png" alt="Caramel Pudding" />
            <div className="recipes card-title">Caramel Pudding</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup Cocofina sugar</li>
                <li>2 cups milk</li>
                <li>2 tbsp custard powder</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Melt Cocofina sugar to make caramel. Prepare custard with milk. Pour over caramel and chill.</p>
              <p className="recipes card-tagline">Smooth, creamy dessert.</p>
            </div>
          </div>

          {/* Donuts */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD5.png" alt="Donuts" />
            <div className="recipes card-title">Donuts</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1 cup flour</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1/2 cup milk</li>
                <li>1 egg</li>
                <li>1 tsp baking powder</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix all ingredients. Pour into donut mold. Bake at 180°C for 15 mins.</p>
              <p className="recipes card-tagline">Healthier baked donuts.</p>
            </div>
          </div>

          {/* Brownies */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD6.png" alt="Brownies" />
            <div className="recipes card-title">Brownies</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>1/2 cup flour</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1/3 cup cocoa powder</li>
                <li>1/2 cup butter</li>
                <li>2 eggs</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Melt butter, mix with sugar. Add eggs and cocoa. Add flour and mix. Bake at 180°C for 20–25 mins.</p>
              <p className="recipes card-tagline">Fudgy and rich.</p>
            </div>
          </div>

        </div>

        {/* ===== ROW 3 ===== */}
        <div className="recipes cards-grid">

          {/* Ice Cream */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD7.png" alt="Ice Cream" />
            <div className="recipes card-title">Ice Cream</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>2 cups cream</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1 tsp vanilla</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Whip cream. Add Cocofina sugar & vanilla. Freeze for 6–8 hours.</p>
              <p className="recipes card-tagline">Creamy and natural sweetened.</p>
            </div>
          </div>

          {/* Banana Bread */}
          <div className="recipes card dark">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD8.png" alt="Banana Bread" />
            <div className="recipes card-title">Banana Bread</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>2 ripe bananas</li>
                <li>1 cup flour</li>
                <li>1/2 cup Cocofina sugar</li>
                <li>1/4 cup oil</li>
                <li>1 tsp baking soda</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mash bananas. Mix all ingredients. Bake at 180°C for 30–35 mins.</p>
              <p className="recipes card-tagline">Moist and healthy snack.</p>
            </div>
          </div>

          {/* Apple Crumble */}
          <div className="recipes card light">
            <div className="recipes card-deco-wrap">
              <img src="/DB.png" alt="" />
            </div>
            <img className="recipes card-img" src="/BD9.png" alt="Apple Crumble" />
            <div className="recipes card-title">Apple Crumble</div>
            <div className="recipes card-body">
              <div className="recipes card-heading">Ingredients:</div>
              <ul className="recipes card-list">
                <li>2 apples (peeled & chopped)</li>
                <li>1/4 cup Cocofina sugar</li>
                <li>1/2 tsp cinnamon</li>
                <li>1 tbsp lemon juice</li>
              </ul>
              <div className="recipes card-heading">For Crumble Topping:</div>
              <ul className="recipes card-list">
                <li>1/2 cup flour</li>
                <li>1/4 cup butter</li>
                <li>2 tbsp Cocofina sugar</li>
              </ul>
              <div className="recipes card-heading">Method:</div>
              <p className="recipes card-method-text">Mix apples with Cocofina sugar, cinnamon, and lemon juice. Place in a baking dish. In another bowl, rub butter + flour + Cocofina sugar to make crumbs. Spread crumble over apples. Bake at 180°C for 25–30 minutes until golden.</p>
              <p className="recipes card-tagline">Warm, comforting dessert with a crispy top and soft fruity base.</p>
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

export default BakingDesserts;