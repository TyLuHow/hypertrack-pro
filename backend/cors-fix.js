app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://hypertrack-pro.vercel.app',
            'https://hypertrack-pro-git-main-tyluhos-projects.vercel.app',
            'https://hypertrack-pro-tyluhow.vercel.app',
            'https://tyluHow.github.io'
          ]
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));