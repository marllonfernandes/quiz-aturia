<template>
  <!-- DASHBOARD PRINCIPAL -->
  <div v-if="!isFormVisible && !isAIGeneratorVisible && !isKnowledgeFormVisible" class="flex flex-column gap-4 w-full h-full pb-8 pt-3" style="background-color: #f9f9f9; padding-inline: 1rem; min-height: 100vh;">
    <div class="w-full mx-auto" style="max-width: 800px;">
      <div class="flex flex-column gap-4">
        <div class="flex justify-content-between align-items-center">
          <h2 class="m-0" style="font-size: 1.5rem;"><i class="pi pi-cog mr-2"></i>Admin Dashboard</h2>
          <Button v-if="token" label="Sair" icon="pi pi-sign-out" severity="danger" @click="logout" size="small" outlined />
        </div>
        
        <div v-if="!token" class="flex flex-column align-items-center justify-content-center bg-white p-5 border-round-xl border-1 border-gray-200 mt-4">
          <p class="mb-4 text-center font-medium">Faça login para gerenciar suas perguntas</p>
          <GoogleLogin :callback="handleLogin" />
        </div>
        
        <div v-else class="flex flex-column gap-4">
          <div class="flex justify-content-end">
            <Button label="Atualizar" icon="pi pi-refresh" @click="fetchData" size="small" outlined />
          </div>

          <!-- TOKEN DE AUTOMAÇÃO / AGENTES DE IA -->
          <div class="surface-100 p-4 shadow-2 flex flex-column gap-3 mb-2" style="border-radius: 1rem;">
            <h3 class="m-0 text-xl"><i class="pi pi-cog mr-2"></i>Token de Automação / Agentes de IA</h3>
            <p class="text-sm text-600 m-0">
              Gere um token de segurança de longa duração para integrar o seu sistema com agentes de IA (como Gemini Gems), automações e scripts externos.
            </p>
            <div class="flex flex-column gap-2" v-if="automationToken">
              <div class="flex gap-2">
                <InputText :value="automationToken" readonly class="w-full text-sm font-monospace" />
                <Button icon="pi pi-copy" severity="success" @click="copyAutomationToken" title="Copiar Token" />
              </div>
              <small class="text-green-600 font-bold">✓ Válido por 365 dias (1 ano)</small>
            </div>
            <div class="flex gap-2">
              <Button :label="automationToken ? 'Atualizar/Renovar Token' : 'Gerar Token de Automação'" icon="pi pi-key" severity="info" size="small" @click="generateAutomationToken" />
            </div>
          </div>

          <!-- BASE DE CONHECIMENTO -->
          <div class="surface-100 p-4 shadow-2 flex flex-column gap-3 mb-2" style="border-radius: 1rem;">
            <div class="flex justify-content-between align-items-center">
              <h3 class="m-0 text-xl"><i class="pi pi-book mr-2"></i>Base de Conhecimento Pessoal</h3>
              <Button icon="pi pi-plus" label="Novo Conhecimento" size="small" @click="openAddKnowledge" />
            </div>
            <p class="text-sm text-600 m-0">
              Armazene textos e informações que a IA poderá usar como contexto exclusivo ao gerar perguntas.
            </p>
            <div v-if="knowledgeList.length === 0" class="text-center text-500 py-2 text-sm">Nenhum conhecimento cadastrado.</div>
            <div v-else class="flex flex-column gap-2 mt-2">
              <div v-for="k in knowledgeList" :key="k.id" class="flex justify-content-between align-items-center bg-white p-3 border-round shadow-1">
                <div>
                  <h4 class="m-0 text-md">{{ k.title }}</h4>
                  <p class="m-0 text-sm text-600 overflow-hidden text-overflow-ellipsis white-space-nowrap" style="max-width: 300px;">{{ k.content }}</p>
                </div>
                <div class="flex gap-2">
                  <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEditKnowledge(k)" />
                  <Button icon="pi pi-trash" text rounded severity="danger" @click="deleteKnowledge(k.id)" />
                </div>
              </div>
            </div>
          </div>

          <!-- QUIZZES E PERGUNTAS UNIFICADO -->
          <div class="surface-100 p-4 shadow-2 flex flex-column gap-3 mb-2" style="border-radius: 1rem;">
            <h3 class="m-0 text-xl text-center">Titulo Quiz</h3>
            <div class="flex gap-2">
              <InputText v-model="newQuizTitle" placeholder="Digite o título do quiz" class="w-full" />
              <Button icon="pi pi-plus" @click="createQuiz" />
            </div>
          </div>
          
          <div v-if="quizzes.length === 0 && questions.length === 0" class="text-center text-500 py-3">Nenhum agrupador criado.</div>
          <div v-else class="flex flex-column gap-4">
            <div v-for="group in questionsByQuiz" :key="group.id" class="surface-card p-4 shadow-2" style="border-radius: 1rem; border: 1px solid var(--surface-border);">
              <div class="flex justify-content-between align-items-center mb-3 border-bottom-1 surface-border pb-2">
                <h4 class="m-0 text-xl text-primary cursor-pointer hover:text-primary-600 transition-colors flex align-items-center gap-2" @click="toggleQuiz(group.id)" title="Clique para expandir/minimizar o quiz">
                  <i :class="isQuizExpanded(group.id) ? 'pi pi-folder-open' : 'pi pi-folder'"></i>
                  {{ group.title }}
                </h4>
                <div class="flex align-items-center gap-3">
                  <span class="text-500 text-sm font-bold">{{ group.questions.length }} pergunta(s)</span>
                  <Button v-if="group.id !== 'unassigned'" icon="pi pi-trash" severity="danger" text rounded @click="deleteQuiz(group.id)" />
                </div>
              </div>
              
              <div v-show="isQuizExpanded(group.id)">
                <!-- Botões de ação no topo -->
                <div class="flex gap-2 mb-3 pb-3 border-bottom-1 surface-border">
                  <Button label="Adicionar Pergunta" icon="pi pi-plus" outlined class="flex-1" style="border-radius: 1rem;" @click="openAddQuestion(group.id)" />
                  <Button label="Gerar com IA" icon="pi pi-sparkles" severity="help" outlined class="flex-1" style="border-radius: 1rem;" @click="openAIGenerator(group.id)" />
                </div>

                <div v-if="group.questions.length === 0" class="text-500 text-sm mb-3">Nenhuma pergunta neste quiz.</div>
                
                <div class="flex flex-column gap-3 mb-3">
                  <div v-for="q in group.questions" :key="q.id" class="surface-100 p-3 shadow-1 flex flex-column gap-2 transition-all transition-duration-200" style="border-radius: 1rem;">
                    <div class="flex justify-content-between align-items-start cursor-pointer" @click="toggleQuestion(q.id)">
                      <div class="flex flex-column gap-2 flex-1 pr-3">
                        <div class="flex align-items-center gap-2">
                          <i :class="isQuestionExpanded(q.id) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="text-500"></i>
                          <Tag :value="formatType(q.type)" :severity="getTypeSeverity(q.type)" />
                        </div>
                        <div class="font-bold text-lg" style="word-wrap: break-word;">{{ q.text }}</div>
                      </div>
                      <div class="flex gap-2" @click.stop>
                        <Button icon="pi pi-copy" outlined rounded severity="info" size="small" @click="cloneQuestion(q, group.id)" title="Clonar Pergunta" />
                        <Button icon="pi pi-pencil" outlined rounded severity="secondary" size="small" @click="openEditQuestion(q, group.id)" title="Editar Pergunta" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="deleteQuestion(q.id)" title="Excluir Pergunta" />
                      </div>
                    </div>
                    
                    <div v-show="isQuestionExpanded(q.id)" class="pt-2 mt-1 border-top-1 surface-border">
                      <div v-if="q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE'" class="text-sm text-600">
                        <div class="mb-1"><strong>Opções:</strong> {{ safeParseOptions(q.options).join(', ') }}</div>
                        <div><strong>Correta:</strong> {{ safeParseOptions(q.options)[parseInt(safeParseCorrectAnswerMultiple(q.correctAnswer)) || 0] }}</div>
                      </div>
                      <div v-if="q.type === 'SHORT_ANSWER'" class="text-sm text-600">
                        <div><strong>Respostas aceitas:</strong> {{ safeParseShortAnswer(q.correctAnswer) }}</div>
                      </div>
                      <div class="text-sm text-primary font-bold mt-1">Tempo: {{ q.timeLimit }}s</div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- TELA DE CRIAR/EDITAR PERGUNTA -->
  <div v-if="isFormVisible" class="flex flex-column gap-4 w-full h-full pb-8 pt-3" style="background-color: #f9f9f9; padding-inline: 1rem; min-height: 100vh;">
    <div class="w-full mx-auto bg-white p-4 border-round-xl shadow-1" style="max-width: 800px;">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">{{ editingQuestionId ? 'Editar Pergunta' : 'Nova Pergunta' }}</h2>
        <Button icon="pi pi-times" severity="secondary" text rounded @click="isFormVisible = false" />
      </div>

      <div class="flex flex-column gap-3">
        <Select v-model="newQ.type" :options="questionTypes" optionLabel="label" optionValue="value" class="w-full" />
        
        <InputText v-model="newQ.text" placeholder="Texto da Pergunta" class="w-full" />
        
        <div v-if="newQ.type === 'MULTIPLE_CHOICE'" class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <div v-for="(opt, index) in newQ.options" :key="index" class="flex gap-2 w-full">
              <InputText v-model="newQ.options[index]" :placeholder="'Opção ' + (index + 1)" class="w-full" />
              <Button icon="pi pi-trash" severity="danger" outlined @click="removeOption(index)" :disabled="newQ.options.length <= 2" />
            </div>
          </div>
          <Button label="Adicionar Opção" icon="pi pi-plus" outlined @click="addOption" :disabled="newQ.options.length >= 6" />
          <Select v-model="newQ.correctAnswer" :options="dynamicQuizOptions" optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <div v-if="newQ.type === 'TRUE_FALSE'" class="flex flex-column gap-3">
          <p class="m-0 text-500">As opções serão "Verdadeiro" e "Falso".</p>
          <Select v-model="newQ.correctAnswer" :options="tfOptions" optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <div v-if="newQ.type === 'SHORT_ANSWER'" class="flex flex-column gap-3">
          <InputText v-model="newQ.shortAnswerText" placeholder="Digite a(s) resposta(s) aceita(s) separadas por vírgula" class="w-full" />
        </div>

        <div class="flex gap-3 align-items-center mt-2">
          <Select v-model="newQ.timeLimit" :options="timeLimitOptions" optionLabel="label" optionValue="value" placeholder="Tempo Limite" class="w-full" />
          <Select v-model="newQ.audioUrl" :options="audioOptions" optionLabel="label" optionValue="value" placeholder="Áudio de Fundo" class="w-full" />
        </div>

        <div class="flex flex-column gap-2 mt-2">
          <label class="font-bold text-700">Tema de Fundo</label>
          <div class="flex flex-wrap gap-3">
            <div 
              v-for="t in themeOptions" :key="t.label"
              @click="newQ.theme = t.value"
              class="cursor-pointer border-round-xl p-2 transition-all transition-duration-200 hover:shadow-3 flex flex-column align-items-center gap-2"
              :class="newQ.theme === t.value ? 'border-primary border-2 shadow-2' : 'border-transparent border-2 surface-100 shadow-1'"
              style="width: 100px;"
            >
              <div 
                class="w-full h-4rem border-round-md bg-cover bg-center" 
                :style="{ background: t.value ? `url('${t.value}')` : t.color }"
              ></div>
              <span class="text-xs text-center font-medium">{{ t.label }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-column gap-2 mt-2">
          <label class="font-bold text-700">Mídia da Capa (Imagem/GIF)</label>
          
          <!-- Seleção rápida de mídia pré-definida -->
          <div class="flex flex-wrap gap-2 mb-2">
            <div 
              v-for="(img, idx) in defaultMediaOptions" :key="idx"
              @click="newQ.mediaUrl = img.url"
              class="cursor-pointer border-round-xl overflow-hidden transition-all transition-duration-200 hover:shadow-3"
              :class="newQ.mediaUrl === img.url ? 'border-primary border-3 shadow-2' : 'border-transparent border-3 surface-100 shadow-1'"
              style="width: 80px; height: 60px;"
            >
              <img :src="img.url" :alt="img.label" class="w-full h-full" style="object-fit: cover;" />
            </div>
          </div>

          <div class="flex gap-2 align-items-center">
            <InputText v-model="newQ.mediaUrl" placeholder="Cole a URL ou faça upload" class="flex-1" />
            
            <div class="relative">
              <input 
                type="file" 
                accept="image/*" 
                @change="uploadMedia" 
                class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
                style="z-index: 2;"
                :disabled="isUploading"
              />
              <Button 
                :label="isUploading ? 'Enviando...' : 'Fazer Upload'" 
                :icon="isUploading ? 'pi pi-spin pi-spinner' : 'pi pi-upload'" 
                severity="secondary" 
                outlined 
                style="border-radius: 8px;"
              />
            </div>
          </div>
          <div v-if="newQ.mediaUrl" class="mt-2 border-round-xl overflow-hidden bg-gray-100 flex justify-content-center align-items-center shadow-1" style="height: 150px;">
            <img :src="newQ.mediaUrl" alt="Media Preview" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <Button label="Salvar" icon="pi pi-check" @click="createQuestion" class="flex-1" style="border-radius: 8px;" />
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined @click="isFormVisible = false" class="flex-1" style="border-radius: 8px;" />
        </div>
      </div>
    </div>
  </div>
  <!-- TELA DE CRIAR/EDITAR CONHECIMENTO -->
  <div v-if="isKnowledgeFormVisible" class="flex flex-column gap-4 w-full h-full pb-8 pt-3" style="background-color: #f9f9f9; padding-inline: 1rem; min-height: 100vh;">
    <div class="w-full mx-auto bg-white p-4 border-round-xl shadow-1" style="max-width: 800px;">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">{{ newKnowledge.id ? 'Editar Conhecimento' : 'Novo Conhecimento' }}</h2>
        <Button icon="pi pi-times" severity="secondary" text rounded @click="isKnowledgeFormVisible = false" />
      </div>

      <div class="flex flex-column gap-3">
        <InputText v-model="newKnowledge.title" placeholder="Título (ex: Regras do Jogo)" class="w-full" />
        <Textarea v-model="newKnowledge.content" placeholder="Conteúdo do conhecimento..." rows="6" class="w-full" />

        <div class="flex gap-2 mt-4">
          <Button label="Salvar" icon="pi pi-check" @click="saveKnowledge" class="flex-1" style="border-radius: 8px;" />
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined @click="isKnowledgeFormVisible = false" class="flex-1" style="border-radius: 8px;" />
        </div>
      </div>
    </div>
  </div>

  <!-- TELA DE GERAR COM IA -->
  <div v-if="isAIGeneratorVisible" class="flex flex-column gap-4 w-full h-full pb-8 pt-3" style="background-color: #f9f9f9; padding-inline: 1rem; min-height: 100vh;">
    <div class="w-full mx-auto bg-white p-4 border-round-xl shadow-1" style="max-width: 800px;">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Gerar Perguntas com IA</h2>
        <Button icon="pi pi-times" severity="secondary" text rounded @click="isAIGeneratorVisible = false" />
      </div>

      <div v-if="!isPreviewMode" class="flex flex-column gap-3">
        <Select v-model="aiProvider" :options="aiProviders" optionLabel="label" optionValue="value" placeholder="Selecione a IA" class="w-full" />
        <InputText v-model="aiApiKey" type="password" placeholder="Chave de API (Será salva localmente)" class="w-full" />
        
        <Select v-model="aiQuestionType" :options="questionTypes" optionLabel="label" optionValue="value" placeholder="Tipo de Pergunta" class="w-full" />
        
        <Select v-model="aiSourceFlag" :options="aiSourceOptions" optionLabel="label" optionValue="value" placeholder="Fonte de Conhecimento" class="w-full" />
        
        <MultiSelect 
          v-if="aiSourceFlag === 'knowledge_base' || aiSourceFlag === 'hybrid'"
          v-model="selectedKnowledgeBases" 
          :options="knowledgeList" 
          optionLabel="title" 
          optionValue="id" 
          placeholder="Selecione as bases de conhecimento..." 
          :maxSelectedLabels="3" 
          class="w-full" 
        />

        <div class="flex flex-column gap-2">
          <InputText v-model="aiTopic" placeholder="Tema ou Texto base" class="w-full" />
          <Textarea v-model="aiInstructions" placeholder="Ex: As perguntas devem ser difíceis. Quero 4 opções de resposta para múltipla escolha e 30 segundos para responder." rows="2" class="w-full" />
        </div>

        <div class="flex gap-2 mt-4">
          <Button label="Gerar Perguntas" icon="pi pi-sparkles" severity="help" @click="generateQuestions" :loading="isGenerating" class="flex-1" style="border-radius: 8px;" />
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined @click="isAIGeneratorVisible = false" class="flex-1" :disabled="isGenerating" style="border-radius: 8px;" />
        </div>
      </div>

      <div v-else class="flex flex-column gap-3">
        <div class="surface-100 p-3 shadow-1" style="border-radius: 1rem; max-height: 50vh; overflow-y: auto;">
          <div v-for="(q, index) in aiGeneratedQuestions" :key="index" class="mb-4 border-bottom-1 surface-border pb-3 last:border-none">
            <div class="font-bold mb-2">{{ index + 1 }}. {{ q.text }}</div>
            <div v-if="q.options && q.options.length" class="text-sm mb-1">
              <strong>Opções:</strong> {{ q.options.join(', ') }}
            </div>
            <div v-if="q.correctAnswerIndex !== undefined" class="text-sm text-green-600 font-bold">
              Correta: {{ q.options ? q.options[q.correctAnswerIndex] : (q.correctAnswerIndex === 0 ? 'Verdadeiro' : 'Falso') }}
            </div>
            <div v-if="q.shortAnswerText" class="text-sm text-green-600 font-bold">
              Resposta aceita: {{ q.shortAnswerText }}
            </div>
            <div class="text-xs text-500 mt-1">Tempo: {{ q.timeLimit || 20 }}s</div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <Button label="Salvar Perguntas" icon="pi pi-check" severity="success" @click="saveGeneratedQuestions" class="flex-1" :loading="isSaving" style="border-radius: 8px;" />
          <Button label="Voltar e Editar" icon="pi pi-arrow-left" severity="secondary" outlined @click="isPreviewMode = false" class="flex-1" :disabled="isSaving" style="border-radius: 8px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { setUser } from '../auth';
import axios from 'axios';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import MultiSelect from 'primevue/multiselect';

const router = useRouter();
const toast = useToast();

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';
const token = ref(localStorage.getItem('admin_token') || '');
const automationToken = ref(localStorage.getItem('automation_token') || '');
const questions = ref([]);
const quizzes = ref([]);
const newQuizTitle = ref('');
const activeQuizId = ref(null);
const editingQuestionId = ref(null);
const isFormVisible = ref(false);

const expandedQuestions = ref([]);

const toggleQuestion = (id) => {
  const index = expandedQuestions.value.indexOf(id);
  if (index > -1) {
    expandedQuestions.value.splice(index, 1);
  } else {
    expandedQuestions.value.push(id);
  }
};

const isQuestionExpanded = (id) => expandedQuestions.value.includes(id);

const expandedQuizzes = ref([]);

const toggleQuiz = (id) => {
  const index = expandedQuizzes.value.indexOf(id);
  if (index > -1) {
    expandedQuizzes.value.splice(index, 1);
  } else {
    expandedQuizzes.value.push(id);
  }
};

const isQuizExpanded = (id) => expandedQuizzes.value.includes(id);

const isAIGeneratorVisible = ref(false);
const isGenerating = ref(false);
const isSaving = ref(false);
const isPreviewMode = ref(false);
const aiProvider = ref(localStorage.getItem('ai_provider') || 'gemini');
const aiApiKey = ref(localStorage.getItem('ai_api_key') || '');
const aiTopic = ref('');
const aiInstructions = ref('4 opções de resposta para múltipla escolha e 30 segundos para responder.');
const aiQuestionType = ref('MULTIPLE_CHOICE');
const aiGeneratedQuestions = ref([]);

const knowledgeList = ref([]);
const isKnowledgeFormVisible = ref(false);
const newKnowledge = ref({ id: null, title: '', content: '' });

const aiSourceFlag = ref('internet');
const selectedKnowledgeBases = ref([]);

watch(knowledgeList, (newList) => {
  selectedKnowledgeBases.value = newList.map(k => k.id);
}, { immediate: true });

const aiSourceOptions = ref([
  { label: 'Internet', value: 'internet' },
  { label: 'Apenas Base de Conhecimento', value: 'knowledge_base' },
  { label: 'Híbrido', value: 'hybrid' }
]);

const aiProviders = ref([
  { label: 'Google Gemini (Recomendado)', value: 'gemini' },
  { label: 'OpenAI (ChatGPT)', value: 'openai' }
]);

const safeParseOptions = (optionsStr) => {
  try {
    const parsed = JSON.parse(optionsStr);
    return Array.isArray(parsed) ? parsed : ['', '', '', ''];
  } catch (e) {
    return ['', '', '', ''];
  }
};

const safeParseCorrectAnswerMultiple = (correctAnswerStr) => {
  try {
    const parsed = JSON.parse(correctAnswerStr);
    if (Array.isArray(parsed)) return parsed[0].toString();
    return parsed.toString();
  } catch (e) {
    return '0';
  }
};

const safeParseShortAnswer = (correctAnswerStr) => {
  try {
    const parsed = JSON.parse(correctAnswerStr);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return parsed.toString();
  } catch (e) {
    return '';
  }
};

const openAddQuestion = (quizId) => {
  activeQuizId.value = quizId;
  editingQuestionId.value = null;
  newQ.value = {
    type: 'MULTIPLE_CHOICE',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '0',
    shortAnswerText: '',
    timeLimit: 20,
    audioUrl: '',
    theme: '',
    mediaUrl: '',
    quizId: quizId === 'unassigned' ? null : quizId
  };
  isFormVisible.value = true;
};

const openEditQuestion = (q, quizId) => {
  activeQuizId.value = quizId;
  editingQuestionId.value = q.id;
  newQ.value = {
    type: q.type,
    text: q.text,
    options: q.type === 'MULTIPLE_CHOICE' ? safeParseOptions(q.options) : ['', '', '', ''],
    correctAnswer: q.type === 'SHORT_ANSWER' ? '' : safeParseCorrectAnswerMultiple(q.correctAnswer),
    shortAnswerText: q.type === 'SHORT_ANSWER' ? safeParseShortAnswer(q.correctAnswer) : '',
    timeLimit: q.timeLimit || 20,
    audioUrl: q.audioUrl || '',
    theme: q.theme || '',
    mediaUrl: q.mediaUrl || '',
    quizId: quizId === 'unassigned' ? null : quizId
  };
  isFormVisible.value = true;
};

const cloneQuestion = (q, quizId) => {
  activeQuizId.value = quizId;
  editingQuestionId.value = null;
  newQ.value = {
    type: q.type,
    text: q.text + ' (Cópia)',
    options: q.type === 'MULTIPLE_CHOICE' ? safeParseOptions(q.options) : ['', '', '', ''],
    correctAnswer: q.type === 'SHORT_ANSWER' ? '' : safeParseCorrectAnswerMultiple(q.correctAnswer),
    shortAnswerText: q.type === 'SHORT_ANSWER' ? safeParseShortAnswer(q.correctAnswer) : '',
    timeLimit: q.timeLimit || 20,
    audioUrl: q.audioUrl || '',
    theme: q.theme || '',
    mediaUrl: q.mediaUrl || '',
    quizId: quizId === 'unassigned' ? null : quizId
  };
  isFormVisible.value = true;
};

const decodeToken = (t) => {
  try {
    return JSON.parse(atob(t.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const isAuthorizedUserForDefaultKey = () => {
  if (!token.value) return false;
  const decoded = decodeToken(token.value);
  if (!decoded || !decoded.email) return false;
  const authorizedEmails = (import.meta.env.VITE_AUTHORIZED_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return authorizedEmails.includes(decoded.email.toLowerCase());
};

const updateDefaultInstructions = () => {
  if (aiQuestionType.value === 'MULTIPLE_CHOICE') {
    aiInstructions.value = '4 opções de resposta para múltipla escolha e 30 segundos para responder. \n Na seleção da opção correta, alterne a posição para dificultar. \n Sempre escolha o som de fundo "divertida"';
  } else if (aiQuestionType.value === 'TRUE_FALSE') {
    aiInstructions.value = 'Verdadeiro ou Falso, As opções serão "Verdadeiro" e "Falso". Tempo de 20 segundos. \n Na seleção da opção correta, alterne a posição para dificultar. \n Sempre escolha o som de fundo "divertida"';
  } else if (aiQuestionType.value === 'SHORT_ANSWER') {
    aiInstructions.value = 'A resposta deve ser curta e objetiva. Tempo de 30 segundos. \n Na seleção da opção correta, alterne a posição para dificultar. \n Sempre escolha o som de fundo "divertida"';
  }
};

const openAIGenerator = (quizId) => {
  activeQuizId.value = quizId === 'unassigned' ? null : quizId;
  isPreviewMode.value = false;
  aiGeneratedQuestions.value = [];
  
  if (isAuthorizedUserForDefaultKey()) {
    aiProvider.value = 'gemini';
    aiApiKey.value = import.meta.env.VITE_AI_API_KEY || '';
  }
  
  isAIGeneratorVisible.value = true;
};

const newQ = ref({
  type: 'MULTIPLE_CHOICE',
  text: '',
  options: ['', '', '', ''],
  correctAnswer: '0',
  shortAnswerText: '',
  timeLimit: 20,
  audioUrl: '',
  theme: '',
  mediaUrl: '',
  quizId: null
});

const isUploading = ref(false);

const uploadMedia = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  isUploading.value = true;
  try {
    const res = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token.value}`
      }
    });
    newQ.value.mediaUrl = res.data.url;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Mídia enviada!', life: 3000 });
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao enviar mídia', life: 3000 });
  } finally {
    isUploading.value = false;
  }
};

const themeOptions = ref([
  { label: 'Padrão', value: '', color: '#f3f4f6' },
  { label: 'Espaço', value: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1000', color: '#1a1a2e' },
  { label: 'Abstrato Azul', value: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=1000', color: '#005bea' },
  { label: 'Gradiente Quente', value: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000', color: '#ff0844' },
  { label: 'Geométrico', value: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?auto=format&fit=crop&q=80&w=1000', color: '#f5576c' },
  { label: 'Cores Vibrantes', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000', color: '#4facfe' }
]);

const defaultMediaOptions = ref([
  { label: 'Ciência', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=300' },
  { label: 'Tecnologia', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300' },
  { label: 'Matemática', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300' },
  { label: 'Geografia', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=300' },
  { label: 'História', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=300' },
  { label: 'Arte', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=300' }
]);

const questionTypes = ref([
  { label: 'Quiz (Múltipla Escolha)', value: 'MULTIPLE_CHOICE' },
  { label: 'Verdadeiro ou Falso', value: 'TRUE_FALSE' },
  { label: 'Resposta Curta', value: 'SHORT_ANSWER' }
]);

const timeLimitOptions = ref([
  { label: '10 segundos', value: 10 },
  { label: '20 segundos', value: 20 },
  { label: '30 segundos', value: 30 },
  { label: '60 segundos', value: 60 },
  { label: '90 segundos', value: 90 },
  { label: '120 segundos', value: 120 }
]);

const audioOptions = ref([
  { label: 'Nenhum', value: '' },
  { label: 'Tensão 1', value: '/sounds/tense.mp3' },
  { label: 'Tic Tac', value: '/sounds/tick.mp3' },
  { label: 'Pensativo', value: '/sounds/thinking.mp3' },
  { label: 'Divertida', value: '/sounds/fun.mp3' }
]);

const dynamicQuizOptions = computed(() => {
  return newQ.value.options.map((opt, index) => ({
    label: `Correta: Opção ${index + 1}`,
    value: index.toString()
  }));
});

const questionsByQuiz = computed(() => {
  const grouped = {};
  quizzes.value.forEach(q => {
    grouped[q.id] = { ...q, questions: [] };
  });
  grouped['unassigned'] = { id: 'unassigned', title: 'Sem Agrupador', questions: [] };
  
  questions.value.forEach(q => {
    if (q.quizId && grouped[q.quizId]) {
      grouped[q.quizId].questions.push(q);
    } else {
      grouped['unassigned'].questions.push(q);
    }
  });
  return Object.values(grouped).filter(g => g.questions.length > 0 || g.id !== 'unassigned');
});

const addOption = () => {
  if (newQ.value.options.length < 6) {
    newQ.value.options.push('');
  }
};

const removeOption = (index) => {
  if (newQ.value.options.length > 2) {
    newQ.value.options.splice(index, 1);
    const correctIdx = parseInt(newQ.value.correctAnswer);
    if (correctIdx === index) {
      newQ.value.correctAnswer = '0';
    } else if (correctIdx > index) {
      newQ.value.correctAnswer = (correctIdx - 1).toString();
    }
  }
};

const tfOptions = ref([
  { label: 'Correta: Verdadeiro', value: '0' },
  { label: 'Correta: Falso', value: '1' }
]);

const formatType = (type) => {
  if (type === 'MULTIPLE_CHOICE') return 'Quiz';
  if (type === 'TRUE_FALSE') return 'T/F';
  if (type === 'SHORT_ANSWER') return 'Curta';
  return type;
};

const getTypeSeverity = (type) => {
  if (type === 'MULTIPLE_CHOICE') return 'info';
  if (type === 'TRUE_FALSE') return 'warning';
  if (type === 'SHORT_ANSWER') return 'success';
  return 'secondary';
};

const handleLogin = async (response) => {
  try {
    const res = await axios.post(`${API_URL}/auth/google`, { credential: response.credential });
    token.value = res.data.token;
    localStorage.setItem('admin_token', token.value);
    setUser(res.data.user);
    fetchData();
  } catch(e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha no login', life: 3000 });
  }
};

const logout = () => {
  token.value = '';
  localStorage.removeItem('admin_token');
  localStorage.removeItem('automation_token');
  setUser(null);
  automationToken.value = '';
  questions.value = [];
  quizzes.value = [];
  knowledgeList.value = [];
};

const generateAutomationToken = async () => {
  try {
    const res = await axios.post(`${API_URL}/auth/token/automation`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    automationToken.value = res.data.token;
    localStorage.setItem('automation_token', automationToken.value);
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Token de automação gerado/atualizado!', life: 3000 });
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao gerar token de automação', life: 3000 });
  }
};

const copyAutomationToken = () => {
  navigator.clipboard.writeText(automationToken.value);
  toast.add({ severity: 'success', summary: 'Copiado', detail: 'Token copiado com sucesso!', life: 3000 });
};

const fetchData = async () => {
  fetchQuizzes();
  fetchQuestions();
  fetchKnowledge();
};

const fetchKnowledge = async () => {
  if (!token.value) return;
  try {
    const res = await axios.get(`${API_URL}/knowledge`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    knowledgeList.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const openAddKnowledge = () => {
  newKnowledge.value = { id: null, title: '', content: '' };
  isKnowledgeFormVisible.value = true;
};

const openEditKnowledge = (k) => {
  newKnowledge.value = { ...k };
  isKnowledgeFormVisible.value = true;
};

const saveKnowledge = async () => {
  if (!newKnowledge.value.title || !newKnowledge.value.content) {
    return toast.add({ severity: 'error', summary: 'Erro', detail: 'Título e conteúdo são obrigatórios.', life: 3000 });
  }
  try {
    if (newKnowledge.value.id) {
      await axios.put(`${API_URL}/knowledge/${newKnowledge.value.id}`, newKnowledge.value, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Conhecimento atualizado!', life: 3000 });
    } else {
      await axios.post(`${API_URL}/knowledge`, newKnowledge.value, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Conhecimento criado!', life: 3000 });
    }
    isKnowledgeFormVisible.value = false;
    fetchKnowledge();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar conhecimento.', life: 3000 });
  }
};

const deleteKnowledge = async (id) => {
  if (!confirm('Deseja excluir este conhecimento?')) return;
  try {
    await axios.delete(`${API_URL}/knowledge/${id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Conhecimento excluído!', life: 3000 });
    fetchKnowledge();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir.', life: 3000 });
  }
};

const fetchQuizzes = async () => {
  if (!token.value) return;
  try {
    const res = await axios.get(`${API_URL}/quizzes`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    quizzes.value = res.data;
  } catch(e) {
    console.error(e);
  }
};

const createQuiz = async () => {
  if(!newQuizTitle.value) return;
  try {
    await axios.post(`${API_URL}/quizzes`, { title: newQuizTitle.value }, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    newQuizTitle.value = '';
    fetchQuizzes();
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Agrupador criado!', life: 3000 });
  } catch(e) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar agrupador', life: 3000 });
  }
};

const deleteQuiz = async (id) => {
  try {
    await axios.delete(`${API_URL}/quizzes/${id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    fetchData();
  } catch(e) {
    console.error(e);
  }
};

const fetchQuestions = async () => {
  if (!token.value) return;
  try {
    const res = await axios.get(`${API_URL}/questions`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    questions.value = res.data;
  } catch(e) {
    if (e.response && e.response.status === 401) {
      logout();
    }
    console.error(e);
  }
};

const createQuestion = async () => {
  if (!newQ.value.text.trim()) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'O texto da pergunta é obrigatório.', life: 3000 });
    return;
  }

  try {
    let finalOptions = [];
    let finalCorrectAnswer = [];

    if (newQ.value.type === 'MULTIPLE_CHOICE') {
      if (newQ.value.options.some(opt => !opt.trim())) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todas as opções do quiz.', life: 3000 });
        return;
      }
      if (newQ.value.correctAnswer === null || newQ.value.correctAnswer === undefined || newQ.value.correctAnswer === '') {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Selecione a resposta correta.', life: 3000 });
        return;
      }
      finalOptions = newQ.value.options;
      finalCorrectAnswer = [parseInt(newQ.value.correctAnswer)];
    } else if (newQ.value.type === 'TRUE_FALSE') {
      if (newQ.value.correctAnswer === null || newQ.value.correctAnswer === undefined || newQ.value.correctAnswer === '') {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Selecione a resposta correta.', life: 3000 });
        return;
      }
      finalOptions = ['Verdadeiro', 'Falso'];
      finalCorrectAnswer = [parseInt(newQ.value.correctAnswer)];
    } else if (newQ.value.type === 'SHORT_ANSWER') {
      if (!newQ.value.shortAnswerText.trim()) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Digite pelo menos uma resposta correta.', life: 3000 });
        return;
      }
      finalOptions = [];
      finalCorrectAnswer = newQ.value.shortAnswerText.split(',').map(s => s.trim()).filter(s => s);
      if (finalCorrectAnswer.length === 0) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Digite pelo menos uma resposta correta.', life: 3000 });
        return;
      }
    }
    
    const payload = {
      text: newQ.value.text,
      type: newQ.value.type,
      options: finalOptions,
      correctAnswer: finalCorrectAnswer,
      timeLimit: newQ.value.timeLimit || 20,
      audioUrl: newQ.value.audioUrl || null,
      theme: newQ.value.theme || null,
      mediaUrl: newQ.value.mediaUrl || null,
      points: 1000,
      quizId: newQ.value.quizId
    };

    if (editingQuestionId.value) {
      await axios.put(`${API_URL}/questions/${editingQuestionId.value}`, payload, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Pergunta atualizada com sucesso!', life: 3000 });
    } else {
      await axios.post(`${API_URL}/questions`, payload, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Pergunta salva com sucesso!', life: 3000 });
    }
    
    newQ.value.text = '';
    newQ.value.options = ['', '', '', ''];
    newQ.value.correctAnswer = '0';
    newQ.value.shortAnswerText = '';
    newQ.value.timeLimit = 20;
    newQ.value.audioUrl = '';
    newQ.value.theme = '';
    newQ.value.mediaUrl = '';
    
    activeQuizId.value = null;
    editingQuestionId.value = null;
    isFormVisible.value = false;
    fetchData();
  } catch(e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar pergunta', life: 3000 });
  }
};

const deleteQuestion = async (id) => {
  try {
    await axios.delete(`${API_URL}/questions/${id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    fetchData();
  } catch(e) {
    console.error(e);
  }
};

const generateQuestions = async () => {
  if (!aiApiKey.value.trim()) {
    return toast.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, insira sua chave de API.', life: 3000 });
  }
  if (!aiTopic.value.trim()) {
    return toast.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, descreva as perguntas.', life: 3000 });
  }

  localStorage.setItem('ai_provider', aiProvider.value);
  localStorage.setItem('ai_api_key', aiApiKey.value);

  isGenerating.value = true;

  let formatExample = '';
  if (aiQuestionType.value === 'MULTIPLE_CHOICE') {
    formatExample = `{
  "text": "Texto da pergunta",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correctAnswerIndex": 0,
  "timeLimit": 30
}`;
  } else if (aiQuestionType.value === 'TRUE_FALSE') {
    formatExample = `{
  "text": "Texto da pergunta",
  "options": ["Verdadeiro", "Falso"],
  "correctAnswerIndex": 0,
  "timeLimit": 20
}`;
  } else if (aiQuestionType.value === 'SHORT_ANSWER') {
    formatExample = `{
  "text": "Texto da pergunta",
  "shortAnswerText": "Resposta aceita 1, Resposta aceita 2",
  "timeLimit": 30
}`;
  }

  let knowledgeContext = '';
  if (aiSourceFlag.value === 'knowledge_base' || aiSourceFlag.value === 'hybrid') {
    if (selectedKnowledgeBases.value.length === 0) {
      isGenerating.value = false;
      return toast.add({ severity: 'error', summary: 'Erro', detail: 'Nenhuma base de conhecimento selecionada. Adicione ou selecione conhecimentos primeiro.', life: 3000 });
    }
    const filteredList = knowledgeList.value.filter(k => selectedKnowledgeBases.value.includes(k.id));
    const texts = filteredList.map(k => `TÍTULO: ${k.title}\nCONTEÚDO:\n${k.content}`).join('\n\n---\n\n');
    knowledgeContext = `\n\n=== BASE DE CONHECIMENTO FORNECIDA ===\n${texts}\n=====================================\n\n`;
  }

  let sourceInstruction = '';
  if (aiSourceFlag.value === 'knowledge_base') {
    sourceInstruction = 'ATENÇÃO: Você deve gerar as perguntas utilizando EXCLUSIVAMENTE as informações contidas na "BASE DE CONHECIMENTO FORNECIDA" abaixo. Não utilize seu conhecimento prévio sobre o assunto.';
  } else if (aiSourceFlag.value === 'hybrid') {
    sourceInstruction = 'ATENÇÃO: Você pode utilizar a "BASE DE CONHECIMENTO FORNECIDA" abaixo junto com o seu próprio conhecimento geral para gerar as perguntas.';
  }

  const prompt = `Você é um gerador de perguntas para um quiz.
Tema/Descrição do usuário: "${aiTopic.value}"
Instruções adicionais: "${aiInstructions.value}"
Tipo de Pergunta selecionado: ${aiQuestionType.value}
${sourceInstruction}
${knowledgeContext}

Retorne APENAS um objeto JSON válido, com a propriedade "questions" contendo um array das perguntas geradas. NADA DE MARKDOWN, APENAS O JSON PURO.
O formato de cada pergunta no array deve seguir rigorosamente este modelo:
${formatExample}
`;

  try {
    let questionsArray = [];

    if (aiProvider.value === 'gemini') {
      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${aiApiKey.value}`, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      const text = res.data.candidates[0].content.parts[0].text;
      const json = JSON.parse(text);
      questionsArray = json.questions || json;
    } else if (aiProvider.value === 'openai') {
      const res = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }, {
        headers: { Authorization: `Bearer ${aiApiKey.value}` }
      });
      const text = res.data.choices[0].message.content;
      const json = JSON.parse(text);
      questionsArray = json.questions || json;
    }

    if (!Array.isArray(questionsArray)) {
      throw new Error("Formato de resposta inválido.");
    }

    aiGeneratedQuestions.value = questionsArray;
    isPreviewMode.value = true;
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao gerar perguntas com a IA. Verifique sua chave de API.', life: 3000 });
  } finally {
    isGenerating.value = false;
  }
};

const saveGeneratedQuestions = async () => {
  if (!aiGeneratedQuestions.value.length) return;
  isSaving.value = true;
  try {
    for (const q of aiGeneratedQuestions.value) {
      if (!q.text) continue;
      
      let finalOptions = [];
      let finalCorrectAnswer = [];
      
      if (aiQuestionType.value === 'MULTIPLE_CHOICE' || aiQuestionType.value === 'TRUE_FALSE') {
        if (!q.options || q.correctAnswerIndex === undefined) continue;
        finalOptions = q.options;
        finalCorrectAnswer = [q.correctAnswerIndex];
      } else if (aiQuestionType.value === 'SHORT_ANSWER') {
        if (!q.shortAnswerText) continue;
        finalOptions = [];
        finalCorrectAnswer = q.shortAnswerText.split(',').map(s => s.trim()).filter(s => s);
      }
      
      const payload = {
        text: q.text,
        type: aiQuestionType.value,
        options: finalOptions,
        correctAnswer: finalCorrectAnswer,
        timeLimit: q.timeLimit || 20,
        points: 1000,
        backgroundAudio: '/sounds/fun.mp3',
        quizId: activeQuizId.value
      };
      
      await axios.post(`${API_URL}/questions`, payload, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
    }

    toast.add({ severity: 'success', summary: 'Sucesso', detail: `${aiGeneratedQuestions.value.length} perguntas salvas!`, life: 3000 });
    isAIGeneratorVisible.value = false;
    isPreviewMode.value = false;
    fetchData();
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar as perguntas.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

if (token.value) {
  fetchData();
}
</script>
