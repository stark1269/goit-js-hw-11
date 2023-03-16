import axios from "axios";

const KEY_API = '34459782-b10817d60787eb29d59e10b91';

export async function getPixabay(value, page) {
  return await axios({
    params: {
      key: KEY_API,
      q: value.trim(),
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: page,
    },
    url: 'https://pixabay.com/api/',
    method: 'get',
  });
};