Screen Size: 2560 x 1600 (13' screen size)

Webpage: https://wijayajessica.github.io/USHousingPrices/?fbclid=IwAR28Ku9WWqNlCkaU4PK_T3r_0w8N_dTG0GcgAdsH7KqA7TdJWqsUz17xs7Y

Github: https://github.com/wijayajessica/cs171-finalproject

Screencast video: 


Vis Kids

Zillow Housing Data

Rita Cui (91170027, tcui@college.harvard.edu)
Jessica Wijaya (11425259, jessicawijaya@g.harvard.edu)
Joey Noszek (41453788, jnoszek@mit.edu)
Katherine Lazar (71299627, katherinelazar@college.harvard.edu)


Very basic style guide: 
- Grey background
- Reds, oranges, yellows
- Black borders where applicable (ie, choropleth)

**Overview of submission**

 /implementation
  /templated-caminar
   /assets
   
    /css
      style.css -> Our group's styling
      main.css -> Styling built into template we used
    /js
      main.js -> Load data and instantiate visualizations
      timeline.js -> Interactive housing price ordering
      forceDiagram.js -> Code for bubble chart showing ZIP code prices
      moveReasons.js -> Bar chart of reasons for moving with slider to select income brackets
      hlBars.js -> Bar chart of state homelessness ratios in different years (not used in website)
      movingscatter.js -> Scatterplot showing income and median housing price over time. User can hover over year to run animation. 
      pricesAreaChart.ks -> When choropleth map is clicked, this area chart updates to show how prices have changed over time in that selected state
      StateChoropleth.js -> Animated US map showing how median house prices have changed over time. Data from 1996-2019. 
      d3.slider.js -> LIBRARY
      popper.min.js -> LIBRARY
      queue.min,js -> LIBRARY
      skel.min.js -> LIBRARY
    /data
      -> Contains all data files
    /images
      -> Contains all images
    index.html
      -> Contains DOM hierarchy



