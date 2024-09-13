"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VapiClient from '@vapi-ai/web';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

// Define Zod schema for form validation
const formSchema = z.object({
  nik: z.string().min(4, "NIK must be at least 4 characters").max(16, "NIK must not exceed 16 characters"),
  name: z.string().min(1, "Name is required"),
});

type FormData = z.infer<typeof formSchema>;

const AiPhone = () => {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [activeCall, setActiveCall] = useState<any>(null);
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null as any);
  const [defaultCall, setDefaultCall] = useState<any>({
    firstMessage: "HALLO , Adakah yang bisa saya bantu ?",
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      messages: [
        {
          role: "assistant",
          content: `You is a specialized AI assistant designed for customer support in the field of BPJS and insurance. With deep expertise in BPJS systems, policies, and insurance processes, you serve as a valuable resource for answering inquiries related to healthcare coverage, claims, and administrative tasks. Integrated with a dynamic database, you can read, interpret, and respond to input data—whether it's a single piece of information or multiple datasets—providing accurate and contextually relevant answers in real-time.

                    Major Mode of Interaction: You operates primarily through audio, providing support specifically related to BPJS and insurance by interpreting the data you input. You can handle both simple and complex datasets, delivering tailored, data-driven responses for users based on real-time information in the integrated database.

                    Training instructions :
                    - You acknowledges every query and confirms data received, e.g., "I have received your information. How can I assist you with your BPJS or insurance question?"
                    - You is able to interpret and process single or multiple data inputs, ensuring that responses are customized to the details provided, whether they pertain to claims, coverage, or payment statuses.
                    - For BPJS and insurance-related inquiries, you answers questions based solely on the data provided, ensuring precise, relevant responses without deviating into irrelevant topics.
                    - You handles complex or ambiguous queries by asking clarifying questions, using the input data to ensure that your response matches the user's specific needs and circumstances.
                    - You expresses empathy and professionalism when addressing users' concerns about BPJS coverage, claims issues, or administrative processes, guiding them through the steps needed to resolve their issues based on the data.
                    - When necessary, you will escalate calls to human agents, particularly for cases that require deeper investigation or highly specific assistance beyond the available data.

                    Note : You must always respond to user questions in Bahasa Indonesia, ensuring that all interactions are conducted in this language to maintain consistency and clarity. If numbers are present in the data or documents that need to be mentioned, you should state those numbers in Bahasa Indonesia Specifically:

                    - If the number 1 is present, you should read it as "satu."
                    - If the number 0 is present, you should read it as "nol".

                    You's mission is to streamline BPJS and insurance-related customer support by leveraging input data to provide accurate, timely, and empathetic responses. Whether dealing with a single data point or multiple datasets, you ensures that agents and users receive the highest level of service by focusing solely on BPJS and insurance information.`,//system prompt
        },
      ],
      maxTokens: 5,
    },
    voice: {
      provider: "11labs",
      voiceId: "OKanSStS6li6xyU1WdXa",
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (VAPI_PUBLIC_KEY) {
      const client = new VapiClient(VAPI_PUBLIC_KEY);
      setVapiClient(client);
    }

    const savedFirstMessage = localStorage.getItem('firstMessage');
    if (savedFirstMessage) {
      setDefaultCall((prevState: any) => ({
        ...prevState,
        firstMessage: savedFirstMessage
      }));
    }
  }, []);

  const startCall = useCallback(async (data: FormData) => {
    try {
      if (!vapiClient) {
        console.log("Client is not initial");
        toast({
          title: "Error",
          description: "Vapi client is not initialized.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }
      console.log("start call", data);

      setIsCallActive(true);
      setCallStatus('Calling...');
      toast({ title: "Calling Start", description: "Please wait a moment", className: "bg-green-100 border-green-400 text-green-700" });
      console.log('GET PARAMS', defaultCall);

      const call = await vapiClient.start({
        "firstMessage": defaultCall.firstMessage,
        "transcriber": {
          "model": "nova-2",
          "language": "id",
          "provider": "deepgram"
        },
        "model": {
          "provider": defaultCall.model.provider,
          "model": defaultCall.model.model,
          messages: [
            {
              role: defaultCall.model.messages[0].role,
              content: defaultCall.model.messages[0].content,
            },
          ],
          "temperature": defaultCall.model.temperature,
          knowledgeBase: {
            provider: "canonical",
            topK: 10,
            fileIds: [
              "1b52e29b-6f48-48b5-9b37-f9ca350e677a"
            ]
          }
        },
        "voice": {
          "provider": "11labs",
          "voiceId": defaultCall.voice.voiceId
        },
        "endCallMessage": "terimakasih, sampai jumpa"
      });
      setActiveCall(call);

      vapiClient.on('call-start', () => {
        toast({ title: "Call Status", description: "Ringing...", className: "bg-green-100 border-green-400 text-green-700" });
      });
      vapiClient.on('speech-start', () => toast({ title: "Call Status", description: "Connected", className: "bg-green-100 border-green-400 text-green-700" }));
      vapiClient.on('call-end', () => {
        toast({ title: "Call Status", description: "Call ended", className: "bg-red-100 border-red-400 text-red-700" });
        setIsCallActive(false);
      });

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: `Failed to start the call: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 3000,
        variant: "destructive",
      });
      setIsCallActive(false);
    }
  }, [vapiClient, defaultCall]);

  const endCall = useCallback(() => {
    if (vapiClient) {
      vapiClient.stop();
    }
    setActiveCall(null);
    setIsCallActive(false);
    setCallStatus('Call ended');
  }, [vapiClient, activeCall]);

  const onSubmit = (data: FormData) => {
    startCall(data);
  };

  return (
    <div className="bg-ai-phone p-6 relative">
      <Link href="/" passHref>
        <Button
          className="absolute top-4 left-4 bg-[#2B243C] hover:bg-[#6b239e] text-white"
          size="sm"
        >
          <img src="svg/house.svg" className="h-4 w-4 mr-2 text-white" color="white" />
          Back to Home
        </Button>
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="form-container flex flex-col space-y-6">
        <div className="space-y-4">
          <Label htmlFor="nik" className="text-white">
            NIK
          </Label>
          <Input
            type="text"
            id="nik"
            placeholder="Input NIK..."
            {...register('nik')}
            style={{ borderRadius: "12px" }}
            className="bg-[#2a2a2ad4] placeholder-white h-11"
          />
          {errors.nik && <p className="text-red-500">{errors.nik.message}</p>}
        </div>
        <div className="space-y-4">
          <Label htmlFor="name" className="text-white">
            Nama Lengkap
          </Label>
          <Input
            type="text"
            id="name"
            placeholder="Input Nama Lengkap..."
            {...register('name')}
            style={{ borderRadius: "12px" }}
            className="bg-[#2a2a2ad4] placeholder-white h-11"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
      </form>

      <div className="fixed bottom-8 right-72 transform -translate-x-1/2 flex space-x-10">
        <button
          className={`w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 ${isCallActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSubmit(onSubmit)}
          disabled={isCallActive}
        >
          <img src="svg/phone.svg" className="h-4 w-4  text-white" color="white" />
        </button>
        <button
          className={`w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 ${isCallActive ? '' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => {
            endCall();
          }}
          disabled={!isCallActive}
        >
          <img src="svg/phone-off.svg" className="h-4 w-4 text-white" color="white" />
        </button>
      </div>
    </div>
  );
};

export default AiPhone;
