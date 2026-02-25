# 🏃🏻‍➡️ ThrillX Recommendation Page
[ThrillX Recommendation Page](https://thrillx-recommendation.web.app/) showcases the result of the development and implementation of a Content-Based Filtering Recommendation system for a previous website named [ThrillX](project-alpha-6c73b.web.app). ThrillX was made as a platform for users to book extreme sports or extreme attraction places in Indonesia, and, as part of my now concluded thesis, this recommendation system aims to meet the needs for continous information searching and decision-making in regards to finding extreme sports and attraction activities in Indonesia. First, Selenium web scraping is used to scrape filtered activity data from the GetYourGuide website, all the while taking into account the theoretical basis regarding extreme sports and attractions for its filtering. Secondly, data pre-processing, using the SpaCy library and Named Entity Recognition (NER), is used for semantic keyword extraction from each activity's description and highlights text data. The system also utilizes Term Frequency – Inverse Document Frequency (TF-IDF), Cosine Similarity, and client-side JavaScript to provide extreme activity recommendations that are tailored to the users’ preferences. Lastly, the website itself is developed using HTML, Tailwind CSS, and JavaScript, while also utilizing Firebase to store activity data, performance metric calculation data, and user interaction logs. 

# ❗ Disclaimer
To clarify about storing user interaction logs, it is worth noting that, upon accessing the website, no user data will be stored _except_ if the user chooses to test the website's features by selecting their preferences and clicking the "Find My Adventure" submit button. 

# 📊 The Result
The result of implementing and performance testing show that the recommendation system has a high level of accuracy; achieving Precision values of 0.84 – 0.95 as well as F1-score values of 0.92 to 1.0. Furthermore, the analysis of the user satisfaction questionnaire confirms that the better the Information Quality presented by the system, the higher the level of user satisfaction. The regression analysis produced values, such as 𝛽 = 0.820 and 𝑝 < .001, which proves that Information Quality significantly influences overall user satisfaction. To learn more about my thesis, you can access the official UPH Repository [via this link](https://repository.uph.edu/id/eprint/73885/).

## 🌐 Live Demo
[Visit the Live Site](https://thrillx-recommendation.web.app/)

## ⚙️ Web Features
- Selectable preferences ranging from places of interest to the types of activities a user might like.
- Client-side processing to calculate TF-IDF, Cosine Similarity, and Performance Metrics Results.
- Dynamic activities display from Firestore, rendered using client-side JavaScript.

## 🔧 General Info
- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Firebase Firestore, Firebase Hosting
- **Other Tools:** FontAwesome, Python, Selenium, Jeffrey's Amazing Statistics Program (JASP)

## ❗ Important Info
- Sensitive Firebase configuration files (such as `config.js`) **will not be uploaded in this repository for security reasons**. To run the project locally, please **create your own `config.js`** file and insert your Firebase credentials.
- Firebase deployment settings (`.firebaserc`) have been **intentionally excluded** to prevent accidental deployment. If you plan to deploy the project, please **set up and use your own Firebase project**.

**🔥 [Firebase Setup Documentation](https://firebase.google.com/docs/web/setup)**
