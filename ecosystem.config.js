module.exports = {
	apps: [
		{
			name: 'aware',
			script: './src/index.js',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'development',
				PORT: 3000,
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
		},
	],
};
