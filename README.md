**Timeline and Milestones**

My project can be broken into 7 stages:
- The first stage is research into models. This involves detailed research into which specific machine learning (GAN) model would be the most appropriate for generating game content.

- The second stage is data collection. My plan is to start with trees, as they are the most defining feature of natural terrain. Therefore, it’s not an issue if I don’t have time to collect additional data sets. If I am not able to find appropriate existing datasets, then I plan to scrape images from sources like Flickr.

- The third stage is training. This stage has potential to be very time consuming, and it could also reveal any early shortcomings in my plan. Therefore, it’s important that this stage takes place early in the project development so that I can amend my plan, if necessary.

- The fourth stage is the research and testing of machine learning models to remove the backgrounds from the GAN results. For example, if the GAN is trained on trees, the training data will contain background elements (unless highly curated), and these will persist in the output images. Therefore, it’s essential to separate the trees from the background. This is the area of my project that I am least certain of, so I will allocate additional time to account for this.

- At this point in development, if I am on schedule (detailed below) I can train the GAN on additional environmental assets (e.g. rocks, flowers).

- The fifth stage involves the dynamic placement of assets throughout a simple, static game environment. This will simply be a 2D world, perhaps with some varying terrain height. The realism of this distribution is not the focus of my project; however it is a feature that I can extend upon if I have time.

- The sixth stage is development of a simple back-end API that can be called from unity to generate new assets, etc. This might involve experimentation with creating models as the player explores, or simply loading the environment all at once.

- The seventh stage is research and testing of models to stylize the output images from stage 4 to fit into the game world.

I have scheduled my time such that certain stages will overlap. This is due to data collection and training being intrinsically connected, and because it allows me to work on (and research) other parts of the project while models are being trained. Furthermore, it allows me to experiment with implementation of different models during the research phase.
In addition, I have a generous buffer at the end of my schedule in case I fall behind or run into significant issues. 

---

Week by week schedule (starting on 25/10/21):
- Stage 1: ___1, 2, 3
- Stage 2: ______2, 3, 4, 5…
- Stage 3: ______2, 3, 4, 5, 6... (adjust as needed) 
- Stage 4: _______________5, 6, 7, 8, 9
- Stage 5: ______________________________10, 11, 12, 13, 14…
- Stage 6: ______________________________________12, 13, 14, 15…
- Stage 7: __________________________________________13, 14, 15, 16…
