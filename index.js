// *** Init ***
const express = require('express');
const app = express();
const axios = require('axios')
const rootDir = __dirname;

// NOTE: Two page rules in CloudFlare are redirecting "wylio.com/" and "img.wylio.com/" to www.wylio.com/ keeping any paths intact.
// I used a placeholder "A" record (192.0.1.2) as the data for "wylio.com" because a DNS record for it was required for the page rule to work.
// https://community.cloudflare.com/t/redirect-example-com-to-www-example-com/78348

// *** Handlers ***

// Redirect all www.wylio.com/credits/flickr/{photoid} links to the flickr page for that photo
const flickrFwdUrl = (req, res) => {
  res.redirect(`https://www.flickr.com/photo.gne?id=${req.params.photoid}`)
};
// Redirect requests for img.wylio.com/flickr/*arbitrary_path_depth*/{photoid}
// to images stored in a public google cloud storage bucket
// https://cloud.google.com/storage/docs/access-public-data
const flickrImgUrl = (req, res) => {
  
  const lastSlash = req.path.lastIndexOf('/') + 1;
  const lastJpg = req.path.lastIndexOf('.jpg');
  const photoid = req.path.substring(lastSlash);
  
  let photoUrl = `https://img.wylio.evns.dev/${photoid}.jpg`;

  // Allow for the *.jpg extension exist in the img request.
  if (lastJpg > -1){
      photoUrl = `https://img.wylio.evns.dev/${photoid}`;
  }
  
  axios
  .get(photoUrl)
  .then(response => {
    res.redirect(photoUrl);
  })
  .catch(error => {
    res.redirect(`https://img.wylio.evns.dev/notfound.jpg`);
  })
};

//Index file
const indexFile = (req, res) => {
  res.sendFile(rootDir + "/views/index.html");
};

// *** Middleware ***

// Public assets
app.use("/public", express.static('public'))

// *** Mount points ***

// Credits link click
app.get('/credits/flickr/:photoid', flickrFwdUrl);

// Img host url
app.get('/flickr/**', flickrImgUrl);

app.get('/', indexFile);

app.listen(3000, () => {
  console.log('server started');
});
