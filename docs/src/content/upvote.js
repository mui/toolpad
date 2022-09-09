import ROUTES from '../route';

const upvote = {
  title: '👍 Upvote the features you want to get prioritized',
  description:
    'Want to request a feature? Head over to our repo and if not already listed, feel free to open an issue explaining the use case.',
  action: {
    href: ROUTES.toolpadUpvote,
    label: 'Upvote',
  },
};

export default upvote;
