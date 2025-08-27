import React from 'react';
import { Search, Filter } from 'lucide-react';

const CourseFilters = ({ filters, onFiltersChange, onClearFilters }) => {
    const categories = [
        'Agricultura',
        'Ganadería',
        'Horticultura',
        'Agroecología',
        'Tecnología Agrícola',
        'Comercialización',
        'Sostenibilidad'
    ];

    const levels = [
        { value: 'beginner', label: 'Principiante' },
        { value: 'intermediate', label: 'Intermedio' },
        { value: 'advanced', label: 'Avanzado' }
    ];

    const handleFilterChange = (key, value) => {
        onFiltersChange({ [key]: value });
    };

    const hasActiveFilters = filters.search || filters.category || filters.level;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Filter className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                </div>
                
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar cursos
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            id="search"
                            placeholder="Título, descripción, instructor..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Categoría */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                    </label>
                    <select
                        id="category"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Nivel */}
                <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de dificultad
                    </label>
                    <select
                        id="level"
                        value={filters.level}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Todos los niveles</option>
                        {levels.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Filtros adicionales en una segunda fila */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Precio */}
                <div>
                    <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
                        Rango de precio
                    </label>
                    <select
                        id="priceRange"
                        value={filters.priceRange || ''}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Cualquier precio</option>
                        <option value="free">Gratuitos</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-200">$100 - $200</option>
                        <option value="200+">Más de $200</option>
                    </select>
                </div>

                {/* Duración */}
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Duración
                    </label>
                    <select
                        id="duration"
                        value={filters.duration || ''}
                        onChange={(e) => handleFilterChange('duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Cualquier duración</option>
                        <option value="0-10">Menos de 10 horas</option>
                        <option value="10-25">10 - 25 horas</option>
                        <option value="25-50">25 - 50 horas</option>
                        <option value="50+">Más de 50 horas</option>
                    </select>
                </div>

                {/* Ordenar por */}
                <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                        Ordenar por
                    </label>
                    <select
                        id="sortBy"
                        value={filters.sortBy || 'created_at'}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="created_at">Más recientes</option>
                        <option value="title">Título A-Z</option>
                        <option value="price_asc">Precio menor</option>
                        <option value="price_desc">Precio mayor</option>
                        <option value="rating">Mejor valorados</option>
                        <option value="enrolled_count">Más populares</option>
                    </select>
                </div>
            </div>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Filtros activos:</span>
                    
                    {filters.search && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Búsqueda: "{filters.search}"
                        </span>
                    )}
                    
                    {filters.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {filters.category}
                        </span>
                    )}
                    
                    {filters.level && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {levels.find(l => l.value === filters.level)?.label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseFilters;