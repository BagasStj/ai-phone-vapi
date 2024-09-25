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
import { Toaster } from "@/components/ui/toaster";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

// Define Zod schema for form validation
const formSchema = z.object({
  nik: z.string().min(4, "NIK must be at least 4 characters").max(16, "NIK must not exceed 16 characters"),
  name: z.string().min(1, "Name is required"),
});

type FormData = z.infer<typeof formSchema>;

const initialprompt = `You is a specialized AI assistant designed for customer support in the field of BPJS and insurance. With deep expertise in BPJS systems, policies, and insurance processes, you serve as a valuable resource for answering inquiries related to healthcare coverage, claims, and administrative tasks. Integrated with a dynamic database, you can read, interpret, and respond to input data—whether it's a single piece of information or multiple datasets—providing accurate and contextually relevant answers in real-time.

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

                    You's mission is to streamline BPJS and insurance-related customer support by leveraging input data to provide accurate, timely, and empathetic responses. Whether dealing with a single data point or multiple datasets, you ensures that agents and users receive the highest level of service by focusing solely on BPJS and insurance information.
                    
                    You have data  Name is "john doe" and  NIK "1001" and my number phone is "1001" and have data about BPJS and insurance takaful
                    `

const AiPhone = () => {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [activeCall, setActiveCall] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [promptTambahan , setPromptTambahan] = useState('')
  const [isUserValid, setIsUserValid] = useState<boolean>(true); // Changed to true by default
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
          content: initialprompt
        },
      ],
      maxTokens: 5,
    },
    voice: {
      provider: "11labs",
      voiceId: "3mAVBNEqop5UbHtD8oxQ",
    },
  });

  const [fileIds, setFileIds] = useState<string[]>([]);

  // Commented out form-related code
  /*
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  */

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

    // Retrieve fileIds from localStorage
    const savedFileId = localStorage.getItem('idFileVapi');
    if (savedFileId) {
      // Ensure fileIds is always an array
      setFileIds([savedFileId]);
    }

  }, []);

  const startCall = useCallback(async (prompt:string) => {
    try {
      if (!vapiClient) {
        console.log("Client is not initial");
        toast({
          title: "Error",
          description: "Vapi client is not initialized.",
          duration: 3000,
          variant: "destructive"
        });
        return;
      }
      console.log("start call");

      setIsCallActive(true);
      setCallStatus('Calling...');
      toast({ title: "Calling Start", description: "Please wait a moment", className: "bg-green-100 border-green-400 text-green-700",     duration: 3000, });
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
            fileIds: fileIds.length > 0 ? fileIds : ["1b52e29b-6f48-48b5-9b37-f9ca350e677a"]
          }
        },
        "voice": {
          "provider": "11labs",
          "voiceId": defaultCall.voice.voiceId,
          similarityBoost:1,
          model:"eleven_turbo_v2_5",
          stability:1
        },
        "endCallMessage": "terimakasih, sampai jumpa"
      });
      setActiveCall(call);

      vapiClient.on('call-start', () => {
     
          toast({ title: "Call Status", description: "Ringing...", className: "bg-green-100 border-green-400 text-green-700" ,     duration: 3000 });
      });
      vapiClient.on('speech-start', () => toast({ title: "Call Status", description: "Connected", className: "bg-green-100 border-green-400 text-green-700" ,      duration: 3000}));
      vapiClient.on('call-end', () => {
        toast({ title: "Call Status", description: "Call ended", className: "bg-red-100 border-red-400 text-red-700"  ,    duration: 1000});
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
  }, [vapiClient, defaultCall, fileIds]);

  const endCall = useCallback(() => {
    if (vapiClient) {
      vapiClient.stop();
    }
    setActiveCall(null);
    setIsCallActive(false);
    setCallStatus('Call ended');
  }, [vapiClient, activeCall]);

  // Commented out onSubmit function
  /*
  const onSubmit = async (data: FormData) => {
    setIsUserValid(false);
    try {
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nik: data.nik, name: data.name }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (result.isValid) {
        toast({
          title: "User Verified",
          description: "User data found in the database.",
          duration: 3000,
          className: "bg-green-100 border-green-400 text-green-700"
        });
        setIsUserValid(true);
        setUserData(result.data);
        
        // Add user data to defaultCall content
        // setDefaultCall((prevState: any) => ({
        //   ...prevState,
        //   model: {
        //     ...prevState.model,
        //     messages: [
        //       {
        //         ...prevState.model.messages[0],
        //         content: `${prevState.model.messages[0].content} \n you have data which Name is ${result.data.namalengkap} and  NIK ${result.data.nik} and my number phone is ${result.data.nomorhp}`              }
        //     ]
        //   }
        // }));

        
        // const promptTambahan = `
        // ${initialprompt} \n you have data which Name is ${result.data.namalengkap} and  NIK ${result.data.nik} and my number phone is ${result.data.nomorhp}
        // `
        
        setTimeout(() => {
          startCall(promptTambahan);
        }, 1000);
      } else {
        toast({
          title: "User Not Found",
          description: "User data not found in the database.",
          duration: 3000,
          variant: "destructive",
        });
        setIsUserValid(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: "Error",
        description: "Failed to check user data.",
        duration: 3000,
        variant: "destructive",
      });
      setIsUserValid(false);
    }
  };
  */

  return (
    <div className="bg-ai-phone p-6 relative min-h-screen flex flex-col justify-center items-center">
      <Toaster />
      <Link href="/" passHref>
        <Button
          className="absolute top-4 left-4 bg-[#2B243C] hover:bg-[#6b239e] text-white sm:text-sm"
          size="sm"
        >
          <img src="svg/house.svg" className="h-4 w-4 mr-2 text-white" color="white" />
          Back to Home
        </Button>
      </Link>

      {/* Commented out form */}
      {/*
      <form onSubmit={handleSubmit(onSubmit)} className="form-container flex flex-col space-y-6 w-full max-w-md px-4 sm:px-0 mt-20 sm:mt-0">
        <div className="space-y-4">
          <Label htmlFor="nik" className="text-white text-sm sm:text-base">
            NIK
          </Label>
          <Input
            type="text"
            id="nik"
            placeholder="Input NIK..."
            {...register('nik')}
            className="bg-[#2a2a2ad4] placeholder-white h-11 text-sm sm:text-base"
            style={{ borderRadius: "12px" }}
          />
          {errors.nik && <p className="text-red-500 text-xs sm:text-sm">{errors.nik.message}</p>}
        </div>
        <div className="space-y-4">
          <Label htmlFor="name" className="text-white text-sm sm:text-base">
            Nama Lengkap
          </Label>
          <Input
            type="text"
            id="name"
            placeholder="Input Nama Lengkap..."
            {...register('name')}
            className="bg-[#2a2a2ad4] placeholder-white h-11 text-sm sm:text-base"
            style={{ borderRadius: "12px" }}
          />
          {errors.name && <p className="text-red-500 text-xs sm:text-sm">{errors.name.message}</p>}
        </div>
        <Button
          type="submit"
          className="mt-4 bg-green-600 hover:bg-green-700 w-full text-sm sm:text-base"
        >
          Check Data and Call 
        </Button>
      </form>
      */}

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-10 sm:right-96 sm:left-auto sm:transform-none">
        <button
          className={`w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 ${isCallActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => startCall(promptTambahan)}
          disabled={isCallActive}
        >
          <img src="svg/phone.svg" className="h-4 w-4 text-white" color="white" />
        </button>
        <button
          className={`w-14 h-14 sm:w-16 sm:h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 ${isCallActive ? '' : 'opacity-50 cursor-not-allowed'}`}
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
