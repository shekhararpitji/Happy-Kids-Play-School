import { Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

function Home() {
    return (
        <Box>
            {/* Hero Section */}
            <Box 
                sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h2" gutterBottom>
                                    Welcome to Happy Kids Play School
                                </Typography>
                                <Typography variant="h5" paragraph>
                                    Where Learning Meets Fun!
                                </Typography>
                                <Button 
                                    component={RouterLink} 
                                    to="/admissions"
                                    variant="contained" 
                                    color="secondary" 
                                    size="large"
                                >
                                    Apply Now
                                </Button>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <img 
                                    src="/benson.jpg" 
                                    alt="Happy Kids Playing" 
                                    style={{ width: '100%', borderRadius: '16px' }}
                                />
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" align="center" gutterBottom>
                    Why Choose Us?
                </Typography>
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card sx={{ height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={feature.image}
                                        alt={feature.title}
                                    />
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body1">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

const features = [
    {
        title: 'Safe Environment',
        description: 'Our facility is designed with child safety in mind, providing a secure and nurturing environment.',
        image: '/benson.jpg'
    },
    {
        title: 'Qualified Teachers',
        description: 'Our experienced teachers are passionate about early childhood education.',
        image: '/benson.jpg' 
    },
    {
        title: 'Creative Learning',
        description: 'We encourage creativity and exploration through hands-on activities and play-based learning.',
        image: '/benson.jpg'
    }
];

export default Home;