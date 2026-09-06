import {
  recommendationView,
  profileBasisView
} from '../models/index.js';

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function createRecommendation(
  code,
  title,
  message,
  basedOn
) {
  return recommendationView({
    code,
    title,
    message,
    basedOn
  });
}

export function createRecommendationsService(
  repository
) {
  return {
    async list(userId) {
      const profile =
        await repository.getProfile(userId);

      const requiredFields = [
        ['age', profile?.age],
        ['weightKg', profile?.weight_kg],
        ['heightCm', profile?.height_cm],
        ['healthGoals', profile?.health_goals]
      ];

      const missingFields = requiredFields
        .filter(([, value]) => {
          if (value === null || value === undefined) {
            return true;
          }

          return (
            typeof value === 'string' &&
            !value.trim()
          );
        })
        .map(([field]) => field);

      if (missingFields.length > 0) {
        return {
          status: 'profile_incomplete',
          message:
            'Complete seu perfil para receber recomendações personalizadas.',
          missingFields,
          recommendations: []
        };
      }

      const recommendations = [];

      recommendations.push(
        createRecommendation(
          'PROFILE_TRACKING',
          'Mantenha seu perfil atualizado',
          'Mantenha idade, peso, altura e objetivos atualizados para que as recomendações continuem coerentes com as informações registradas.',
          [
            'age',
            'weightKg',
            'heightCm',
            'healthGoals'
          ]
        )
      );

      const goals = normalize(
        profile.health_goals
      );

      if (
        goals.includes('agua') ||
        goals.includes('hidrat')
      ) {
        recommendations.push(
          createRecommendation(
            'HYDRATION_TRACKING',
            'Acompanhe sua hidratação',
            'Use os registros de água e suas metas pessoais para acompanhar a regularidade da hidratação ao longo do tempo.',
            ['healthGoals']
          )
        );
      }

      if (
        goals.includes('atividade') ||
        goals.includes('exercicio') ||
        goals.includes('treino') ||
        goals.includes('passos') ||
        goals.includes('movimento') ||
        goals.includes('condicionamento')
      ) {
        recommendations.push(
          createRecommendation(
            'ACTIVITY_TRACKING',
            'Acompanhe sua rotina de atividades',
            'Use o histórico de atividades e progresso para observar a consistência relacionada ao objetivo informado no perfil.',
            ['healthGoals']
          )
        );
      }

      if (
        goals.includes('sono') ||
        goals.includes('descanso') ||
        goals.includes('bem-estar') ||
        goals.includes('bem estar')
      ) {
        recommendations.push(
          createRecommendation(
            'ROUTINE_TRACKING',
            'Organize sua rotina',
            'Utilize lembretes e registros de hábitos para acompanhar a rotina relacionada ao objetivo informado.',
            ['healthGoals']
          )
        );
      }

      if (
        goals.includes('peso') ||
        goals.includes('emagrec') ||
        goals.includes('massa') ||
        goals.includes('composicao corporal')
      ) {
        recommendations.push(
          createRecommendation(
            'WEIGHT_PROGRESS_TRACKING',
            'Acompanhe sua evolução',
            'Utilize o histórico de progresso e mantenha as medidas do perfil atualizadas para acompanhar mudanças ao longo do tempo.',
            ['weightKg', 'healthGoals']
          )
        );
      }

      if (recommendations.length === 1) {
        recommendations.push(
          createRecommendation(
            'GOAL_TRACKING',
            'Acompanhe seus objetivos',
            'Use os recursos de progresso, atividades e lembretes para acompanhar o objetivo registrado no seu perfil.',
            ['healthGoals']
          )
        );
      }

      return {
        status: 'ready',
        profileBasis:
          profileBasisView(profile),
        recommendations,
        medicalNotice:
          profile.medical_conditions?.trim()
            ? 'Condições de saúde foram informadas no perfil. O Smart Health não gera prescrição clínica ou tratamento com base nessas informações.'
            : null
      };
    }
  };
}
