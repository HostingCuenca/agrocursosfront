import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Award, Target, Star, CheckCircle } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

const Home = () => {
    const sponsors = [
        'https://desarrolloagropecuarioecuador.com/assets/2.jpeg',
        'https://desarrolloagropecuarioecuador.com/assets/3.jpeg',
        'https://desarrolloagropecuarioecuador.com/assets/4.jpeg',
        'https://desarrolloagropecuarioecuador.com/assets/5.jpeg',
        'https://desarrolloagropecuarioecuador.com/assets/6.jpeg',
        'https://desarrolloagropecuarioecuador.com/assets/7.jpeg',
        'https://desarrolloagropecuarioecuador.com/assets/8.jpeg',
    ];

    const features = [
        {
            icon: BookOpen,
            title: 'Cursos Especializados',
            description: 'Programas diseñados por expertos en agricultura sostenible y ganadería tecnificada.',
            color: 'text-primary-600'
        },
        {
            icon: Users,
            title: 'Instructores Certificados',
            description: 'Aprende de profesionales con amplia experiencia en el sector agropecuario.',
            color: 'text-olive-600'
        },
        {
            icon: Award,
            title: 'Certificación Reconocida',
            description: 'Obtén certificados avalados por instituciones del sector agropecuario.',
            color: 'text-blue-600'
        },
        {
            icon: Target,
            title: 'Enfoque Práctico',
            description: 'Metodología que combina teoría con aplicación práctica en casos reales.',
            color: 'text-purple-600'
        },
    ];

    const stats = [
        { number: '500+', label: 'Estudiantes Graduados' },
        { number: '25+', label: 'Cursos Disponibles' },
        { number: '98%', label: 'Satisfacción' },
        { number: '15+', label: 'Instructores Expertos' },
    ];

    const testimonials = [
        {
            name: 'María González',
            role: 'Agricultora',
            text: 'Los cursos me ayudaron a implementar técnicas sostenibles que aumentaron mi productividad en un 40%.',
            rating: 5
        },
        {
            name: 'Carlos Mendoza',
            role: 'Ganadero',
            text: 'Excelente formación. Ahora manejo mi ganado con tecnologías modernas y eficientes.',
            rating: 5
        },
        {
            name: 'Ana Rodríguez',
            role: 'Ingeniera Agrónoma',
            text: 'La certificación me abrió nuevas oportunidades laborales en el sector.',
            rating: 5
        },
    ];

    return (
        <div className="min-h-screen font-tiktok">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-50 to-olive-50 py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Centro de Formación
                                <span className="block text-olive-600">Desarrollo Agropecuario</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                                Impulsa tu carrera en el sector agropecuario con nuestra plataforma educativa
                                especializada. Aprende técnicas modernas, sostenibles e innovadoras.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/register"
                                    className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
                                >
                                    Comenzar Ahora
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn-secondary px-8 py-4 text-lg text-center"
                                >
                                    Acceder
                                </Link>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative">
                            <div className="aspect-w-16 aspect-h-12 lg:aspect-h-16">
                                <img
                                    src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80"
                                    alt="Agricultura moderna"
                                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                                />
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-olive-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Certificación Garantizada</div>
                                        <div className="text-sm text-gray-600">Reconocida nacionalmente</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            ¿Por qué elegir CFDA?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Ofrecemos una experiencia educativa integral diseñada específicamente
                            para profesionales del sector agropecuario.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="group text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <Icon className={`w-8 h-8 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Lo que dicen nuestros estudiantes
                        </h2>
                        <p className="text-xl text-gray-600">
                            Historias reales de transformación profesional
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-primary-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">
                                    "{testimonial.text}"
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sponsors Carousel */}
            <section className="py-16 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h3 className="text-lg font-medium text-gray-500 mb-8">
                            Instituciones que confían en nosotros
                        </h3>
                    </div>

                    <div className="overflow-hidden">
                        <div className="flex carousel-scroll">
                            {/* Duplicamos para efecto infinito */}
                            {[...sponsors, ...sponsors].map((sponsor, index) => (
                                <div key={index} className="flex-shrink-0 mx-8">
                                    <img
                                        src={sponsor}
                                        alt={`Sponsor ${index + 1}`}
                                        className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-olive-600 to-olive-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        ¿Listo para transformar tu carrera agropecuaria?
                    </h2>
                    <p className="text-olive-100 text-xl mb-10 max-w-3xl mx-auto">
                        Únete a cientos de profesionales que han mejorado sus habilidades y
                        aumentado su productividad con nuestros cursos especializados.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/register"
                            className="bg-white text-olive-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all inline-flex items-center"
                        >
                            Registrarse Gratis
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link
                            to="/courses"
                            className="border-2 border-white text-white hover:bg-white hover:text-olive-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                        >
                            Explorar Cursos
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-olive-100">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>Registro gratuito</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>Certificación incluida</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>Soporte 24/7</span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;