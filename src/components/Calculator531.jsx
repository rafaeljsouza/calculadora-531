import React, { useState, useEffect } from 'react';
import './Calculator531.css';

// Hook personalizado para detectar o modo escuro
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Verifica o modo inicial
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Adiciona um listener para mudanças no modo
    const handler = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);

    // Limpa o listener quando o componente é desmontado
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDarkMode;
};

const Calculator531 = () => {
  const [maxes, setMaxes] = useState({
    squat: '',
    bench: '',
    deadlift: '',
    press: ''
  });
  
  const [trainingMaxes, setTrainingMaxes] = useState({
    squat: '',
    bench: '',
    deadlift: '',
    press: ''
  });
  
  const [activeTab, setActiveTab] = useState('squat');
  const [unit, setUnit] = useState('kg');
  const isDarkMode = useDarkMode(); // Usa o hook personalizado
  
  // Calcular os TMs (90% do 1RM)
  useEffect(() => {
    const newTrainingMaxes = {};
    Object.keys(maxes).forEach(lift => {
      if (maxes[lift] && !isNaN(maxes[lift])) {
        newTrainingMaxes[lift] = Math.floor(maxes[lift] * 0.9);
      } else {
        newTrainingMaxes[lift] = '';
      }
    });
    setTrainingMaxes(newTrainingMaxes);
  }, [maxes]);
  
  // Arredondar para o incremento mais próximo
  const roundToNearest = (value, increment = 2.5) => {
    return Math.round(value / increment) * increment;
  };
  
  // Gerar a tabela de treino para um exercício específico
  const generateWorkoutTable = (lift) => {
    if (!trainingMaxes[lift] || isNaN(trainingMaxes[lift])) {
      return null;
    }
    
    const tm = trainingMaxes[lift];
    
    // Percentuais para cada semana/set
    const percentages = [
      // Semana 1
      [0.65, 0.75, 0.85],
      // Semana 2
      [0.70, 0.80, 0.90],
      // Semana 3
      [0.75, 0.85, 0.95],
      // Semana 4 (deload)
      [0.40, 0.50, 0.60]
    ];
    
    // Reps para cada semana/set
    const reps = [
      // Semana 1
      ["5", "5", "5+"],
      // Semana 2
      ["3", "3", "3+"],
      // Semana 3
      ["5", "3", "1+"],
      // Semana 4
      ["5", "5", "5"]
    ];
    
    // Calcular os pesos para cada semana/set
    const weeks = [];
    
    for (let week = 0; week < 4; week++) {
      const sets = [];
      for (let set = 0; set < 3; set++) {
        const percentage = percentages[week][set];
        const weight = roundToNearest(tm * percentage);
        sets.push({
          weight,
          reps: reps[week][set]
        });
      }
      weeks.push(sets);
    }
    
    return weeks;
  };
  
  const handleMaxChange = (e, lift) => {
    const value = e.target.value;
    setMaxes(prev => ({
      ...prev,
      [lift]: value
    }));
  };
  
  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };
  
  const workoutTable = generateWorkoutTable(activeTab);
  
  return (
    <div className={`calculator-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="header">
        <h1>Calculadora 5/3/1 de Powerlifting</h1>
        <p>Baseada no método de Jim Wendler</p>
      </header>
      
      <div className="calculator-card">
        <div className="input-section">
          <h2>1. Insira seus máximos (1RM)</h2>
          
          <div className="unit-selector">
            <label>Unidade:</label>
            <select 
              value={unit} 
              onChange={handleUnitChange}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
          
          <div className="max-inputs">
            {['squat', 'bench', 'deadlift', 'press'].map(lift => (
              <div key={lift} className="max-input-item">
                <label className="capitalize">1RM {lift}:</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={maxes[lift]}
                    onChange={(e) => handleMaxChange(e, lift)}
                    placeholder={`Insira valor`}
                  />
                  <span>{unit}</span>
                </div>
                {trainingMaxes[lift] && (
                  <p className="training-max">
                    TM: {trainingMaxes[lift]} {unit}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="table-section">
          <h2>2. Tabela de treino</h2>
          
          <div className="tabs">
            {['squat', 'bench', 'deadlift', 'press'].map(lift => (
              <button
                key={lift}
                className={`tab ${activeTab === lift ? 'active' : ''}`}
                onClick={() => setActiveTab(lift)}
              >
                {lift === 'squat' ? 'Squat' : 
                 lift === 'bench' ? 'Bench' : 
                 lift === 'deadlift' ? 'Deadlift' : 'Press'}
              </button>
            ))}
          </div>
          
          {workoutTable ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Set</th>
                    <th>Semana 1</th>
                    <th>Semana 2</th>
                    <th>Semana 3</th>
                    <th>Semana 4 (Deload)</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2].map(setIndex => (
                    <tr key={setIndex}>
                      <td className="set-number">Set {setIndex + 1}</td>
                      {[0, 1, 2, 3].map(weekIndex => (
                        <td key={weekIndex}>
                          <div className="weight-reps">
                            <span className="weight">{workoutTable[weekIndex][setIndex].weight} {unit}</span>
                            <span className="reps">
                              {workoutTable[weekIndex][setIndex].reps} reps
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert">
              <p>
                Insira seu 1RM para {activeTab === 'squat' ? 'squat' : 
                               activeTab === 'bench' ? 'bench' : 
                               activeTab === 'deadlift' ? 'deadlift' : 'press'} para visualizar a tabela de treino.
              </p>
            </div>
          )}
        </div>
        
        <div className="notes-section">
          <h3>Notas:</h3>
          <ul>
            <li>O TM (Training Max) é calculado como 90% do seu 1RM</li>
            <li>Na notação 5+, 3+, 1+, o "+" significa fazer o máximo de repetições possíveis (AMRAP)</li>
            <li>Semana 4 é a semana de deload para recuperação</li>
            <li>Após cada ciclo de 4 semanas, aumente seu TM em 2,5-5kg para exercícios superiores e 5-10kg para exercícios inferiores</li>
          </ul>
        </div>
      </div>
      
      <footer className="footer">
        <p>Baseado no programa 5/3/1 de Jim Wendler</p>
      </footer>
    </div>
  );
};

export default Calculator531;