import Self from './self';
require('dotenv').config();

(async () => {
	const client = new Self();
	client.login(process.env.TOKEN);
})();
